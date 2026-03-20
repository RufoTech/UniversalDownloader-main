import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";

const execAsync = promisify(exec);

// Helper function to handle cookies
function getCookiesPath() {
  // 1. Check for local cookies.txt file in the root first
  const localCookiesFile = path.join(process.cwd(), "cookies.txt");
  if (fs.existsSync(localCookiesFile)) {
    return localCookiesFile;
  }

  // 2. Check for environment variables
  const ytCookies = process.env.YOUTUBE_COOKIES || "";
  const igCookies = process.env.INSTAGRAM_COOKIES || "";
  
  if (!ytCookies && !igCookies) return null;
  
  // Combine all cookie strings into one
  const combinedCookies = [ytCookies, igCookies].filter(Boolean).join('\n');
  
  const tempDir = os.tmpdir();
  const cookiesPath = path.join(tempDir, "combined_cookies.txt");
  
  // Write cookies to temp file
  fs.writeFileSync(cookiesPath, combinedCookies.replace(/\\n/g, '\n'));
  return cookiesPath;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ detail: "Link daxil edilməyib" }, { status: 400 });
  }

  // Basic sanitization, but keep important query params for TikTok
  let cleanUrl = url;
  if (url.includes("tiktok.com")) {
    // If it's a tiktok photo link, we might need to change it to a video link format for yt-dlp to recognize it
    // TikTok sometimes uses /photo/ instead of /video/ for image posts
    cleanUrl = cleanUrl.replace("/photo/", "/video/");
  } else {
    cleanUrl = url.split("&")[0];
  }

  try {
    // Cobalt API intersept for Instagram
    if (cleanUrl.includes("instagram.com")) {
      try {
        const res = await fetch("https://api.cobalt.tools/", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          },
          body: JSON.stringify({ url: cleanUrl })
        });

        if (res.ok) {
          const data = await res.json();
          let items: any[] = [];
          
          if (data.status === "picker") {
            items = data.picker.map((p: any, i: number) => ({
              id: `ig-${i}`,
              title: "Instagram Post",
              thumbnail: p.thumb || p.url,
              duration: 0,
              isImageOnly: p.type === "photo",
              formats: p.type === "video" ? [{
                format_id: "cobalt",
                resolution: "1080p",
                height: 1080,
                ext: "mp4",
                filesize: 0
              }] : []
            }));
          } else if (data.status === "redirect" || data.status === "tunnel" || data.status === "stream") {
            items = [{
              id: "ig-vid",
              title: "Instagram Post",
              thumbnail: null,
              duration: 0,
              isImageOnly: false,
              formats: [{
                format_id: "cobalt",
                resolution: "1080p",
                height: 1080,
                ext: "mp4",
                filesize: 0
              }]
            }];
          }

          if (items.length > 0) {
            return NextResponse.json({ items });
          }
        }
      } catch (err) {
        console.error("Cobalt Info Error:", err);
        // Fallback to yt-dlp below
      }
    }

    // Check if yt-dlp is available by trying to get version first (debugging step)
    try {
      await execAsync("yt-dlp --version");
    } catch (e) {
      console.error("yt-dlp is not accessible in the current path/environment:", e);
      return NextResponse.json({ detail: "yt-dlp sistemdə tapılmadı və ya işləmir." }, { status: 500 });
    }

    const cookiesPath = getCookiesPath();
    let ytDlpCmd = `yt-dlp -J --no-warnings`;
    
    if (cookiesPath) {
      ytDlpCmd += ` --cookies "${cookiesPath}"`;
    }

    console.log(`Executing yt-dlp for URL: ${cleanUrl}`);
    const { stdout, stderr } = await execAsync(`${ytDlpCmd} "${cleanUrl}"`);
    
    if (!stdout) {
      console.error("Empty stdout from yt-dlp. Stderr:", stderr);
      throw new Error("Məlumat tapılmadı");
    }

    const rawInfo = JSON.parse(stdout);
    
    // yt-dlp can return playlists (like IG carousels or TikTok photo slides)
    const entries = rawInfo._type === "playlist" ? (rawInfo.entries || []) : [rawInfo];
    
    const results = entries.map((info: any) => {
      const formats = info.formats || [];
      const availableFormats: any[] = [];
      const seenHeights = new Set();

      formats.forEach((f: any) => {
        // Video formats with valid height
        if (f.vcodec !== "none" && f.vcodec !== "" && f.height && f.height > 0) {
          if (!seenHeights.has(f.height)) {
            seenHeights.add(f.height);
            availableFormats.push({
              format_id: f.format_id,
              resolution: `${f.height}p`,
              height: f.height,
              ext: f.ext || "mp4",
              filesize: f.filesize || f.filesize_approx || 0,
            });
          }
        }
      });

      // Sort by height descending
      availableFormats.sort((a: any, b: any) => b.height - a.height);
      
      // Get best thumbnail for image download
      let bestThumbnail = null;
      
      // If it's TikTok, prioritize standard images/thumbnails
      if (info.extractor === "tiktok" || cleanUrl.includes("tiktok.com")) {
        // TikTok sometimes returns specific high-res image thumbnails for photo slides
        const imageFormats = formats.filter((f: any) => f.ext === "jpg" || f.ext === "png" || f.ext === "webp" || f.vcodec === "none");
        if (imageFormats.length > 0) {
          bestThumbnail = imageFormats[imageFormats.length - 1].url;
        }
      }
      
      if (!bestThumbnail && info.thumbnails && info.thumbnails.length > 0) {
        // usually the last one is the highest resolution
        bestThumbnail = info.thumbnails[info.thumbnails.length - 1].url;
      }

      // If no thumbnail found, check if the main object has an image
      if (!bestThumbnail && info.thumbnail) {
        bestThumbnail = info.thumbnail;
      }

      // If it's purely an image post, formats might be empty, but we'll have a thumbnail
      return {
        id: info.id || Math.random().toString(36).substring(7),
        title: info.title || "Video",
        thumbnail: bestThumbnail,
        duration: info.duration || 0,
        formats: availableFormats,
        isImageOnly: availableFormats.length === 0 && !!bestThumbnail,
      };
    });

    return NextResponse.json({ items: results });

  } catch (error: any) {
    console.error("Info extraction error full details:", error);
    
    let errorMessage = "Məlumat alına bilmədi. Linkin düzgünlüyünü yoxlayın.";
    
    // Yt-dlp spesifik xətaları tutmaq üçün
    if (error.stderr) {
      if (error.stderr.includes("HTTP Error 403")) {
        errorMessage = "YouTube təhlükəsizlik qaydalarına görə (403 Forbidden) bu videoya giriş qadağandır.";
      } else if (error.stderr.includes("Video unavailable")) {
        errorMessage = "Video mövcud deyil və ya gizlidir.";
      } else {
        errorMessage = `Xəta: ${error.stderr.split('\n')[0]}`;
      }
    }

    return NextResponse.json({ detail: errorMessage }, { status: 500 });
  }
}
