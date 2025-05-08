export function load() {
    Toast.success('屏蔽比赛直播插件已加载！')

    const iframe = document.createElement("iframe");
    iframe.id = "tv-official-pop";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
}