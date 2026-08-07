"""Flood-fill remove near-white background from light HireHub logo."""

from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\Admin\.cursor\projects\d-CODES-hirehub-updated\assets"
    r"\c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_9bb580db2e3244240f00182dc135eab0_images_"
    r"ChatGPT_Image_logo_Aug_6__2026__12_35_16_PM-bbf715fb-3629-4a46-bbff-4ff708ccdd22.png"
)
OUT = Path(r"D:\CODES\hirehub-updated\hirehub-client-02\public\logo-light.png")


def is_bg(r: int, g: int, b: int) -> bool:
    brightness = (r + g + b) / 3
    mx, mn = max(r, g, b), min(r, g, b)
    saturation = 0.0 if mx == 0 else (mx - mn) / mx
    return brightness >= 220 and saturation < 0.12


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Flood-fill from all edge pixels that look like background.
    stack: list[tuple[int, int]] = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))

    seen = [[False] * w for _ in range(h)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        r, g, b, a = pixels[x, y]
        if not is_bg(r, g, b):
            continue
        seen[y][x] = True
        pixels[x, y] = (r, g, b, 0)
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    # Soften remaining near-white leftovers inside (not flood-connected).
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            brightness = (r + g + b) / 3
            mx, mn = max(r, g, b), min(r, g, b)
            saturation = 0.0 if mx == 0 else (mx - mn) / mx
            if brightness >= 245 and saturation < 0.08:
                pixels[x, y] = (r, g, b, 0)

    bbox = img.getbbox()
    if bbox:
        pad = 16
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(w, bbox[2] + pad)
        bottom = min(h, bbox[3] + pad)
        img = img.crop((left, top, right, bottom))

    bw, bh = img.size
    side = max(bw, bh)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - bw) // 2, (side - bh) // 2), img)
    square = square.resize((512, 512), Image.Resampling.LANCZOS)
    square.save(OUT, "PNG", optimize=True)

    # Sanity: corners must be fully transparent
    px = square.load()
    for pt in ((0, 0), (511, 0), (0, 511), (511, 511)):
        assert px[pt][3] == 0, f"corner {pt} not transparent: {px[pt]}"
    print(f"OK {OUT} bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    main()
