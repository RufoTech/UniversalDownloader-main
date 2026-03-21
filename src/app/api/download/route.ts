import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

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

function sanitizeFilename(title: string) {
  const replacements: Record<string, string> = {
    'ə': 'e', 'Ə': 'E', 'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O', 'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S', 'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G'
  };

  let cleanTitle = title;
  for (const [key, value] of Object.entries(replacements)) {
    cleanTitle = cleanTitle.replace(new RegExp(key, 'g'), value);
  }

  cleanTitle = cleanTitle.replace(/[^\w\s-]/gi, '').trim();
  return cleanTitle || "video";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const format = req.nextUrl.searchParams.get("format") || "mp4";
  const qualityId = req.nextUrl.searchParams.get("quality_id");
  const itemId = req.nextUrl.searchParams.get("item_id"); // Used if downloading a specific item from a playlist/carousel

  if (!url) {
    return NextResponse.json({ detail: "Link daxil edilməyib" }, { status: 400 });
  }

  let cleanUrl = url;
  if (url.includes("tiktok.com")) {
    cleanUrl = cleanUrl.replace("/photo/", "/video/");
  } else {
    cleanUrl = url.split("&")[0];
  }
  const isAudio = format === "mp3";

  try {
    const isYoutube = cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be");
    let cobaltQuality = "1080";
    if (isYoutube && qualityId) {
      // Handle new cobalt-prefixed format IDs from info route
      if (qualityId.startsWith("cobalt-")) {
        cobaltQuality = qualityId.replace("cobalt-", "");
      }
      // Handle legacy yt-dlp format IDs
      else if (qualityId === "136" || qualityId === "22") cobaltQuality = "720";
      else if (qualityId === "135") cobaltQuality = "480";
      else if (qualityId === "134" || qualityId === "18") cobaltQuality = "360";
      else if (qualityId === "133") cobaltQuality = "240";
      else if (qualityId === "160" || qualityId === "394") cobaltQuality = "144";
    }

    // 1. First Fallback: Cobalt API (For Instagram and YouTube)
    if (cleanUrl.includes("instagram.com") || isYoutube) {
      try {
        const payload: any = { url: cleanUrl };
        if (isYoutube) {
          payload.videoQuality = cobaltQuality;
          if (isAudio) payload.downloadMode = "audio";
        }

        console.log(`Cobalt API request: quality=${cobaltQuality}, isAudio=${isAudio}, payload=${JSON.stringify(payload)}`);
        const res = await fetch("https://api.cobalt.tools/", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(`Cobalt API response: status=${res.status}, body=${JSON.stringify(data)}`);

        if (res.ok) {
          let targetUrl = data.url;

          if (data.status === "picker" && data.picker) {
            if (itemId && itemId.startsWith("ig-")) {
               const index = parseInt(itemId.replace("ig-", ""), 10);
               if (!isNaN(index) && data.picker[index]) {
                   targetUrl = data.picker[index].url;
               }
            } else {
               targetUrl = data.picker[0].url;
            }
          }

          if (targetUrl) {
            const vidRes = await fetch(targetUrl);
            if (vidRes.ok) {
              const extFromUrl = targetUrl.includes(".jpg") || targetUrl.includes(".webp") || targetUrl.includes("jpg") ? "jpg" : "mp4";
              const mimeType = extFromUrl === "jpg" ? "image/jpeg" : (isAudio ? "audio/mp4" : "video/mp4");
              const title = data.filename || "download";
              const finalExt = extFromUrl === "jpg" ? "jpg" : (isAudio ? "m4a" : "mp4");
              
              return new NextResponse(vidRes.body as any, {
                headers: {
                  "Content-Type": mimeType,
                  "Content-Disposition": `attachment; filename="${title}.${finalExt}"`,
                }
              });
            }
          }
        } else {
          console.error(`Cobalt API failed: ${res.status} - ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.error("Cobalt Download Error:", err);
      }
    }

    // 2. Second Fallback: Local Disk Merging yt-dlp
    const cookiesPath = getCookiesPath();
    const titleArgs = ["--print", "title", "--extractor-args", "youtube:player_client=ios,android"];
    if (cookiesPath) titleArgs.push("--cookies", cookiesPath);
    titleArgs.push(cleanUrl);

    const getTitleCmd = spawn("yt-dlp", titleArgs);
    let rawTitle = "video";
    
    await new Promise<void>((resolve) => {
      getTitleCmd.stdout.on("data", (data) => {
        rawTitle = data.toString().trim();
      });
      getTitleCmd.on("close", () => resolve());
    });

    const title = sanitizeFilename(rawTitle);

    let formatFlag = "";
    let ext = "mp4";
    let mimeType = "video/mp4";

    if (isAudio) {
      formatFlag = "bestaudio";
      ext = "m4a";
      mimeType = "audio/mp4";
    } else {
      if (qualityId && qualityId !== "undefined" && qualityId !== "null") {
        // Allows yt-dlp to merge independent video and audio formats into a final mp4
        formatFlag = `${qualityId}+bestaudio[ext=m4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best`;
      } else {
        formatFlag = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
      }
    }

    const tempFilePath = path.join(os.tmpdir(), `dl_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);
    const args = ["-f", formatFlag, "-o", tempFilePath, "--extractor-args", "youtube:player_client=ios,android"];
    if (cookiesPath) args.push("--cookies", cookiesPath);
    args.push(cleanUrl);

    const downloadCmd = spawn("yt-dlp", args);

    return new Promise<NextResponse>((resolve) => {
      downloadCmd.on("close", (code) => {
        if (code !== 0 || !fs.existsSync(tempFilePath)) {
          console.error(`yt-dlp failed or file not found: ${tempFilePath}`);
          resolve(NextResponse.json({ detail: "Disk Download Failed" }, { status: 500 }));
          return;
        }

        const fileStream = fs.createReadStream(tempFilePath);
        const readableStream = new ReadableStream({
          start(controller) {
            fileStream.on("data", (chunk) => controller.enqueue(chunk));
            fileStream.on("end", () => {
              controller.close();
              fs.unlink(tempFilePath, () => {}); // Cleanup
            });
            fileStream.on("error", (err) => {
              controller.error(err);
              fs.unlink(tempFilePath, () => {}); // Cleanup
            });
          },
          cancel() {
            fileStream.destroy();
            fs.unlink(tempFilePath, () => {}); // Cleanup
          }
        });

        resolve(new NextResponse(readableStream, {
          headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="${title}.${ext}"`,
          }
        }));
      });
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ detail: "Daxili Server Xətası" }, { status: 500 });
  }
}
