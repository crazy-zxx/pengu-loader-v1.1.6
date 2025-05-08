export function init(context) {
  Toast.success('自动补充骰子插件已加载！')

  // 补充骰子请求的一个必要参数
  let area;
  // 事件监听器
  window.addEventListener("message", (event) => {
    // 大乱斗、无限乱斗的界面打开事件（aram_reroll_main_show）
    if (event?.data?.messageType === "aram_reroll_main_show") {
      // 从界面中获取重置骰子的链接地址
      const src = document.querySelector('#aram_reroll').src;
      // 分割获取链接地址中最后的html请求文件名
      const type = src.substr(src.lastIndexOf('/') + 1).split('.html')[0]
      // 如果参数未初始化
      if (!area) {
        // 初始化，赋值为链接地址中的area请求参数值
        area = new URLSearchParams(src.split('?')[1]).get('area')
      }
      // 补充骰子
      getDice({ ...paramsConfig[type], sArea: area });
    }
  })
}

// 补充骰子的请求体数据（公共部分）
const paramsConfig = {
  // 无限乱斗
  'random-infinite': {
    iChartId: '393050',
    iSubChartId: '393050',
    sIdeToken: '6f9Yvi'
  },
  // 极地大乱斗
  'random': {
    iChartId: '378916',
    iSubChartId: '378916',
    sIdeToken: 'Rb22Nt',
  }
};

async function getDice(params) {
  // 补充骰子的请求地址
  const url = 'https://comm.ams.game.qq.com/ide/';
  // 构造请求数据包
  const options = {
    // 需要使用 post 方法
    method: 'POST',
    // 在请求头设置请求体的数据格式
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    // 请求体数据
    body: new URLSearchParams(params)
  };

  try {
    // 发送补充骰子的请求
    const response = await fetch(url, options);
    // 响应数据
    const data = await response.json();
    // 控制台输出响应结果
    console.log('尝试补充骰子', data);
    // 显示窗口提示
    Toast.success(data.sMsg)
  } catch (error) {
    // 显示窗口提示
    Toast.error('尝试补充骰子失败:' + error?.message || JSON.stringify(error))
  }
}