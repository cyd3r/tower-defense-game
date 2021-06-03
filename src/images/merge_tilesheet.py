from PIL import Image

ingame = Image.open("tower-defense-top-down/towerDefense_tilesheet@2.png")
menu = Image.open("tower-defense-top-down/RTS_medieval@2.png")

tilesheet = Image.new("RGBA", (max(ingame.width, menu.width), ingame.height + menu.height))
tilesheet.paste(ingame, (0, 0))
tilesheet.paste(menu, (0, ingame.height))

tilesheet.paste(Image.open("kenney_piratepack/tile_16.png"), (ingame.width+128, 0))
tilesheet.paste(Image.open("kenney_piratepack/tile_93.png"), (ingame.width+128, 128))
tilesheet.paste(Image.open("kenney_piratepack/tile_94.png"), (ingame.width+128, 256))

tilesheet.save("tilesheet.png")
