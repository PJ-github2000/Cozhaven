import re
import sys

with open('video-sitemap.xml', 'r', encoding='utf-8') as f:
    content = f.read()

players = re.findall(r'<video:player_loc>(.*?)</video:player_loc>', content)
content_urls = re.findall(r'<video:content_loc>(.*?)</video:content_loc>', content)
thumbnails = re.findall(r'<video:thumbnail_loc>(.*?)</video:thumbnail_loc>', content)

all_links = sorted(list(set(players + content_urls)))

with open('result_videos.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(all_links))
