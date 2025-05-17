/**
 * @name AutoAcceptEnhanced
 * @author theashera
 * @description Auto queue accepter with switches for hiding the match found dialog and auto accepting the match
 * @version 1.0.0
 * @link https://github.com/asherathegod/penguplugins
 * 
 * @author zxx
 * @description 调整设置界面的显示位置，避免大乱斗模式的骰子显示遮挡；修改接受对局的延时为2秒，默认不隐藏找到对局时的接受窗口，给用户取消的机会
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("[Pengu Loader] Auto Accept plugin loaded");

  Toast.success('自动接受对局插件已加载！');
  
  let styleElement = null;
  let originalTexts = [];
  let originalColors = [];
  let textTimeout = null;
  let apiCallTimeout = null;
  let countdownInterval = null;
  let countdownValue = 10;
  let switchesCreated = false;
  let autofillButtonCreated = false;
  let lastKnownLobbyState = null;
  
  // Configuration settings with defaults
  // 自动接受对局、不隐藏找到对局的接受窗口
  let settings = {
    autoAccept: localStorage.getItem('pengu_autoAccept') === 'true' || true,
    hideDialog: localStorage.getItem('pengu_hideDialog') === 'false' || false
  };

  console.log("[Pengu Loader] Auto Accept settings:", settings);

  // Create CSS for our components
  const customCSS = document.createElement('style');
  customCSS.innerHTML = `
    #pengu-switches {
      position: relative !important;
      visibility: visible !important;
      opacity: 1 !important;
      display: flex !important;
      margin: 5px auto !important;
      width: auto !important;
      top: -520px;
      left: 300px;
      z-index: 9999 !important;
    }
    .pengu-switch-container {
      display: flex !important;
      align-items: center !important;
      color: #cdbe91 !important;
      font-size: 11px !important;
      margin: 0 5px !important;
      background-color: rgba(1, 10, 19, 0.7) !important;
      padding: 4px 8px !important;
      border-radius: 3px !important;
      border: 1px solid #785a28 !important;
    }
    .pengu-switch-label {
      margin-right: 5px !important;
      color: #cdbe91 !important;
    }
    .pengu-switch {
      position: relative !important;
      display: inline-block !important;
      width: 28px !important;
      height: 16px !important;
    }
    .pengu-switch input {
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
    }
    .pengu-slider {
      position: absolute !important;
      cursor: pointer !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background-color: #333 !important;
      border-radius: 10px !important;
      transition: .3s !important;
    }
    .pengu-slider:before {
      position: absolute !important;
      content: "" !important;
      height: 12px !important;
      width: 12px !important;
      left: 2px !important;
      bottom: 2px !important;
      background-color: #785a28 !important;
      border-radius: 50% !important;
      transition: .3s !important;
    }
    input:checked + .pengu-slider {
      background-color: #785a28 !important;
    }
    input:checked + .pengu-slider:before {
      background-color: #cdbe91 !important;
      transform: translateX(12px) !important;
    }
    
    #pengu-autofill-button {
      border-radius: 50% !important;
      width: 20px !important;
      height: 20px !important;
      background-color: #785a28 !important;
      color: #cdbe91 !important;
      text-align: center !important;
      line-height: 20px !important;
      cursor: pointer !important;
      margin-right: 5px !important;
      font-weight: bold !important;
      font-size: 12px !important;
    }
    #pengu-autofill-popup {
      position: absolute !important;
      bottom: 30px !important;
      left: 0 !important;
      background-color: rgba(1, 10, 19, 0.9) !important;
      border: 1px solid #785a28 !important;
      padding: 10px !important;
      border-radius: 3px !important;
      color: #cdbe91 !important;
      font-size: 12px !important;
      z-index: 1000 !important;
      display: none !important;
      width: 200px !important;
    }
    .pengu-settings-button {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #1e2328 !important;
      border: 1px solid #785a28 !important;
      color: #cdbe91 !important;
      padding: 4px 8px !important;
      border-radius: 4px !important;
      margin-right: 8px !important;
      font-size: 11px !important;
      cursor: pointer !important;
      margin-left: 5px !important;
    }
    .pengu-settings-icon {
      margin-right: 4px !important;
      width: 14px !important;
      height: 14px !important;
      fill: #cdbe91 !important;
    }
    .pengu-switch-buttons {
      position: relative !important;
      display: flex !important;
      justify-content: center !important;
      gap: 10px !important;
      margin: 5px 0 !important;
    }
    .pengu-switch-button {
      display: flex !important;
      align-items: center !important;
      background-color: rgba(1, 10, 19, 0.8) !important;
      border: 1px solid #785a28 !important;
      color: #cdbe91 !important;
      padding: 5px 10px !important;
      border-radius: 4px !important;
      font-size: 12px !important;
    }
    .pengu-switch-button.active {
      background-color: #785a28 !important;
    }
  `;
  document.head.appendChild(customCSS);
  
  // Create settings button function
  function createSettingsButton() {
    const button = document.createElement('div');
    button.className = 'pengu-settings-button';
    button.innerHTML = `
      <svg class="pengu-settings-icon" viewBox="0 0 24 24">
        <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path>
      </svg>
      Auto Accept
    `;
    
    button.addEventListener('click', () => {
      const switchesContainer = document.getElementById('pengu-switches');
      if (switchesContainer) {
        switchesContainer.style.display = 
          switchesContainer.style.display === 'none' ? 'flex' : 'none';
      } else {
        createSwitches();
      }
    });
    
    return button;
  }

  // Replaces autofill protection with a button and popup
  function handleAutofillProtection() {
    if (autofillButtonCreated) return;
    
    const autofillWarning = document.querySelector('.parties-footer-warning');
    if (!autofillWarning) return;
    
    const originalContent = autofillWarning.innerHTML;
    const originalText = autofillWarning.textContent.trim();
    
    // Create button and popup container
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; position: relative;';
    
    const button = document.createElement('div');
    button.id = 'pengu-autofill-button';
    button.textContent = 'i';
    
    const popup = document.createElement('div');
    popup.id = 'pengu-autofill-popup';
    popup.innerHTML = originalContent;
    
    // Add event listeners for popup
    button.addEventListener('mouseenter', () => {
      popup.style.display = 'block';
    });
    
    button.addEventListener('mouseleave', () => {
      popup.style.display = 'none';
    });
    
    // Add both elements
    container.appendChild(button);
    container.appendChild(popup);
    
    // Replace original content
    autofillWarning.innerHTML = '';
    autofillWarning.appendChild(container);
    autofillButtonCreated = true;
    
    console.log("[Pengu Loader] Replaced autofill protection with button");
    
    // Add our settings button
    const settingsButton = createSettingsButton();
    autofillWarning.appendChild(settingsButton);
  }

  // Create modern toggle buttons directly in the lobby footer
  function createModernToggleButtons() {
    // Check if already exists
    if (document.querySelector('.pengu-switch-buttons')) return false;
    
    // Find the location to add buttons
    const targetElement = document.querySelector('.parties-footer');
    if (!targetElement) return false;
    
    // Create container for buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'pengu-switch-buttons';
    
    // Create Auto Accept button
    const autoAcceptButton = document.createElement('div');
    autoAcceptButton.className = `pengu-switch-button ${settings.autoAccept ? 'active' : ''}`;
    autoAcceptButton.textContent = 'Auto Accept';
    autoAcceptButton.addEventListener('click', () => {
      settings.autoAccept = !settings.autoAccept;
      localStorage.setItem('pengu_autoAccept', settings.autoAccept);
      autoAcceptButton.classList.toggle('active');
      console.log(`[Pengu Loader] autoAccept setting changed to:`, settings.autoAccept);
    });
    
    // Create Hide Dialog button
    const hideDialogButton = document.createElement('div');
    hideDialogButton.className = `pengu-switch-button ${settings.hideDialog ? 'active' : ''}`;
    hideDialogButton.textContent = 'Hide Dialog';
    hideDialogButton.addEventListener('click', () => {
      settings.hideDialog = !settings.hideDialog;
      localStorage.setItem('pengu_hideDialog', settings.hideDialog);
      hideDialogButton.classList.toggle('active');
      console.log(`[Pengu Loader] hideDialog setting changed to:`, settings.hideDialog);
    });
    
    // Add buttons to container
    buttonsContainer.appendChild(autoAcceptButton);
    buttonsContainer.appendChild(hideDialogButton);
    
    // Insert at beginning of target
    targetElement.insertBefore(buttonsContainer, targetElement.firstChild);
    
    switchesCreated = true;
    console.log("[Pengu Loader] Created modern toggle buttons");
    return true;
  }

  // Create and insert toggle switches
  function createSwitches() {
    // Try modern toggle buttons first
    if (createModernToggleButtons()) return;
    
    // Don't create if already exists
    if (document.getElementById('pengu-switches')) {
      console.log("[Pengu Loader] Switches already exist");
      return;
    }
    
    console.log("[Pengu Loader] Creating switches...");
    
    // Try to find potential locations for switches
    const locations = [
      document.querySelector('.v2-footer-notifications'),
      document.querySelector('.parties-footer-warning'), 
      document.querySelector('.center-container'),
      document.querySelector('.parties-footer'),
      document.querySelector('.find-match-button')?.parentElement
    ].filter(loc => loc !== null);
    
    if (locations.length === 0) {
      console.log("[Pengu Loader] Could not find any suitable location for switches");
      return;
    }
    
    // Create switches container
    const switchesContainer = createSwitchesContainer();
    
    // Try each location
    for (const location of locations) {
      try {
        location.prepend(switchesContainer);
        console.log("[Pengu Loader] Added switches to", location);
        switchesCreated = true;
        return;
      } catch (e) {
        console.log("[Pengu Loader] Failed to add switches to", location, e);
      }
    }
  }
  
  function createSwitchesContainer() {
    const switchesContainer = document.createElement('div');
    switchesContainer.id = 'pengu-switches';
    
    // Auto Accept switch
    const autoAcceptSwitch = createSwitch('autoAccept', 'Auto Accept', settings.autoAccept);
    
    // Hide Dialog switch
    const hideDialogSwitch = createSwitch('hideDialog', 'Hide Dialog', settings.hideDialog);
    
    switchesContainer.appendChild(autoAcceptSwitch);
    switchesContainer.appendChild(hideDialogSwitch);
    
    return switchesContainer;
  }

  // Helper function to create a switch element
  function createSwitch(id, label, initialState) {
    const container = document.createElement('div');
    container.className = 'pengu-switch-container';
    
    const labelElem = document.createElement('span');
    labelElem.textContent = label;
    labelElem.className = 'pengu-switch-label';
    
    const switchElem = document.createElement('label');
    switchElem.className = 'pengu-switch';
    
    const checkboxElem = document.createElement('input');
    checkboxElem.type = 'checkbox';
    checkboxElem.id = 'pengu-' + id;
    checkboxElem.checked = initialState;
    
    const sliderElem = document.createElement('span');
    sliderElem.className = 'pengu-slider';
    
    // When checked, update settings
    checkboxElem.addEventListener('change', function() {
      settings[id] = this.checked;
      localStorage.setItem('pengu_' + id, this.checked);
      console.log(`[Pengu Loader] ${id} setting changed to:`, this.checked);
    });
    
    switchElem.appendChild(checkboxElem);
    switchElem.appendChild(sliderElem);
    
    container.appendChild(labelElem);
    container.appendChild(switchElem);
    
    return container;
  }

  function checkformatch() {
    const dialogLargeElement = document.querySelector('.ready-check-timer');
    
    if (dialogLargeElement && !styleElement && (settings.autoAccept || settings.hideDialog)) {
      console.log("[Pengu Loader] Match found dialog detected");
      
      // Only add the style if hideDialog is enabled
      if (settings.hideDialog) {
        styleElement = document.createElement('style');
        styleElement.appendChild(document.createTextNode(`
          .modal { display: none !important }
        `));
        document.body.appendChild(styleElement);
        console.log("[Pengu Loader] Dialog hidden");
      }

      const playerNameElements = document.querySelectorAll('.player-name__game-name.player-name__force-locale-text-direction');
      originalTexts = [];
      originalColors = [];
      countdownValue = 10;

      // Only modify names if hideDialog is enabled
      if (settings.hideDialog) {
        playerNameElements.forEach((element, index) => {
          originalTexts[index] = element.textContent;
          originalColors[index] = element.style.color;

          element.textContent = `Match found (${countdownValue})`;
          element.style.color = "cyan";
        });

        countdownInterval = setInterval(() => {
          countdownValue--;
          playerNameElements.forEach(element => {
            element.textContent = `Match found (${countdownValue})`;
          });

          if (countdownValue <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        textTimeout = setTimeout(() => {
          playerNameElements.forEach((element, index) => {
            element.textContent = originalTexts[index];
            element.style.color = originalColors[index];
          });
        }, 9400);
      }

      // Only make API call if autoAccept is enabled
      // 延时 2秒接 受对局
      if (settings.autoAccept) {
        console.log("[Pengu Loader] Auto accepting in 2 seconds");
        apiCallTimeout = setTimeout(() => {
          fetch('/lol-matchmaking/v1/ready-check/accept', {
            method: 'POST'
          }).then(response => {
            if (response.ok) {
              console.log("[Pengu Loader] Match accepted successfully");
            } else {
              console.log("[Pengu Loader] Failed to accept match");
            }
          }).catch(error => {
            console.log("[Pengu Loader] Error accepting match:", error);
          });
        }, 2000);
      }
    } else if (!dialogLargeElement && styleElement) {
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
        styleElement = null;
      }

      if (textTimeout) clearTimeout(textTimeout);
      if (apiCallTimeout) clearTimeout(apiCallTimeout);
      if (countdownInterval) clearInterval(countdownInterval);

      textTimeout = null;
      apiCallTimeout = null;
      countdownInterval = null;

      if (settings.hideDialog) {
        const playerNameElements = document.querySelectorAll('.player-name__game-name.player-name__force-locale-text-direction');
        playerNameElements.forEach((element, index) => {
          if (index < originalTexts.length) {
            element.textContent = originalTexts[index];
            element.style.color = originalColors[index];
          }
        });
      }
    }
  }
  
  // Check if we're in a lobby by looking for key elements
  function isInLobby() {
    return document.querySelector('.find-match-button') !== null || 
           document.querySelector('.parties-footer') !== null;
  }
  
  // Check for UI changes and add our elements
  function checkForUIChanges() {
    // Determine current lobby state
    const currentlyInLobby = isInLobby();
    
    // If lobby state changed
    if (lastKnownLobbyState !== currentlyInLobby) {
      console.log("[Pengu Loader] Lobby state changed:", currentlyInLobby ? "entered lobby" : "left lobby");
      
      // Reset flags when leaving lobby
      if (!currentlyInLobby) {
        switchesCreated = false;
        autofillButtonCreated = false;
        
        // Remove switches if they exist
        const switchesContainer = document.getElementById('pengu-switches');
        if (switchesContainer) switchesContainer.remove();
        
        const buttonsContainer = document.querySelector('.pengu-switch-buttons');
        if (buttonsContainer) buttonsContainer.remove();
      }
      
      // Update state
      lastKnownLobbyState = currentlyInLobby;
    }
    
    // If in lobby, ensure we have switches
    if (currentlyInLobby && !switchesCreated) {
      // Delay slightly to let the UI settle
      setTimeout(createSwitches, 100);
    }
    
    // Check if we're in ranked with autofill protection
    const autofillWarning = document.querySelector('.parties-footer-warning');
    
    // Handle autofill protection if it exists
    if (autofillWarning && !autofillButtonCreated) {
      setTimeout(handleAutofillProtection, 100);
    }
    
    // Also check for match dialog
    checkformatch();
  }

  // Set up regular checks for UI changes
  setInterval(checkForUIChanges, 1000);

  // Set up mutation observer for DOM changes
  const observer = new MutationObserver(() => {
    checkForUIChanges();
  });
  
  observer.observe(document.body, {
    childList: true, 
    subtree: true   
  });
  
  // Initial check
  checkForUIChanges();
});
