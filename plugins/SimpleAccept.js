export function init({ socket }) {
  Toast.success('自动接受对局插件已加载！');

  // 跟踪当前就绪检查是否已被此插件接受
  let hasAccepted = false;

  // 为下一个队列循环重置状态
  const resetState = () => {
    hasAccepted = false;
    // 可选：如果需要重置反馈，可以在此处添加console.log
    // console.log('SimpleAccept: 准备好处理下一个队列');
  };

  // 监听就绪检查事件
  socket.observe('/lol-matchmaking/v1/ready-check', async (message) => {
    if (message.eventType === 'Delete') {
      // 就绪检查已取消或完全完成
      console.log('放弃')
      resetState();
      return;
    }

    if (message.eventType === 'Update' && message.data) {
      const { playerResponse, state } = message.data;

      // 检查就绪检查是否活跃、我们尚未接受它
      // 并且客户端正在等待我们的响应
      if (state === 'InProgress' && !hasAccepted && playerResponse === 'None') {
        // 稍微延迟接受，以避免与
        // 就绪检查期间加载的性能密集型UI插件发生冲突
        await new Promise((resolve) => setTimeout(resolve, 150));

        // 延迟后再次检查接受状态，以防手动操作
        // 或竞态条件（尽管使用标志后可能性较小）
        if (!hasAccepted) {
          try {
            const response = await fetch(
              '/lol-matchmaking/v1/ready-check/accept',
              {
                method: 'POST',
              }
            );

            if (response.ok) {
              // 成功接受
              hasAccepted = true;
              console.log('已自动接受匹配！');
              Toast.success('自动接受对局成功！');
            } else {
              // 记录API错误（例如4xx、5xx）
              console.error(
                `SimpleAccept: 接受匹配失败 - 状态码 ${response.status}`
              );
              Toast.error('自动接受对局失败！');
              // 如有需要，可选择在失败时重置状态
              // resetState();
            }
          } catch (error) {
            // 记录网络或其他fetch错误
            console.error('SimpleAccept: 接受匹配失败 - 错误:', error);
            // 如有需要，可选择在失败时重置状态
            // resetState();
          }
        }
      } else if (state !== 'InProgress' && hasAccepted) {
        // 如果在我们接受后状态从InProgress改变（例如EveryoneReady、Declined、Invalid）
        // 为下一个可能的检查重置标志
        // 这处理Delete事件可能延迟的情况
        hasAccepted = false;
      }
    }
  });

  // 监听游戏流程阶段变化，以便在队列/游戏之间可靠地重置状态
  socket.observe('/lol-gameflow/v1/gameflow-phase', (message) => {
    const phase = message.data;
    // 当离开队列/英雄选择时重置（例如回到大厅、匹配中或无阶段）
    if (phase === 'None' || phase === 'Lobby' || phase === 'Matchmaking') {
      // 仅在标志为true时重置，防止冗余重置
      if (hasAccepted) {
        resetState();
      }
    }
  });

  console.log('自动接受对局插件初始化完成！');
}
