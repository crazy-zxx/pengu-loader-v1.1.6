export function init(context) {
  // 显示插件加载成功提示
  Toast.success('自动接受对局插件已加载！')

  // 从上下文中获取 socket 对象
  const socket = context.socket

  // 用于跟踪此插件是否接受对局的标志
  let hasAccepted = false;

  // 重置接受对局的标志
  const resetState = () => {
    hasAccepted = false;
    console.log('重置对局接受状态');
  };

  // 观察对局就绪状态事件，添加响应处理
  socket.observe('/lol-matchmaking/v1/ready-check', async (message) => {

    // 删除事件，对局已取消或已接受
    if (message.eventType === 'Delete') {
      console.log('对局已取消或已接受');
      // 重置对局接受状态
      resetState();
      return;
    }

    // 更新事件，对局状态发生变化
    if (message.eventType === 'Update' && message.data) {
      
      // 从消息数据中解析状态
      const { playerResponse, state } = message.data;
      // 找到匹配的对局，对局处于就绪状态，并且当前还未接受对局，并且客户端正在等待我们的响应
      if (state === 'InProgress' && !hasAccepted && playerResponse === 'None') {

        if (!hasAccepted) {
          // 标记接受已开始，避免重复触发
          hasAccepted = true;
          
          // 延时 1s 接受对局，给用户反悔的机会
          setTimeout(async () => {
            try {
              // 发送接受对局的请求
              const response = await fetch('/lol-matchmaking/v1/ready-check/accept', { method: 'POST' });
              // 成功接受对局
              if (response.ok) {
                console.log('成功自动接受对局！');
                Toast.success('成功自动接受对局！');
              }
            } catch (e) {
              console.error('接受失败', e);
              Toast.error('自动接受对局出错！');
            } finally {
              // 重置对局接受状态
              resetState();
            }
          }, 1000);
        }

      } else if (state !== 'InProgress' && hasAccepted) {
        // 如果状态从 InProgress 改变（例如 EveryoneReady、Declined、Invalid）
        // 在我们接受后，为下一次潜在的检查重置标志
        // 这处理了 Delete 事件可能延迟的情况
        resetState();
      }
    }

  });


  // 观察游戏进行的阶段变化，以便在队列/游戏之间进行稳健的状态重置
  socket.observe('/lol-gameflow/v1/gameflow-phase', (message) => {

    // 获取当前的游戏流程阶段
    const phase = message.data;
    // 当处于队列或英雄选择之外时重置状态（例如回到大厅、匹配中或无状态）
    if (phase === 'None' || phase === 'Lobby' || phase === 'Matchmaking') {
      // 仅在标志为 true 时重置，防止冗余重置
      if (hasAccepted) {
        resetState();
      }
    }

  });

}