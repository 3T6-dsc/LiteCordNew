
// Right Click Status Picker
(() => {
    function attachListener() {
        // Select the User Area (bottom left panel)
        const userArea = document.querySelector('section[class*="panels_"]');
        if (!userArea) return;

        // Try to find the clickable wrapper.
        let avatarWrapper = userArea.querySelector('div[class*="accountPopoutButtonWrapper"]');
        if (!avatarWrapper) {
            avatarWrapper = userArea.querySelector('div[class*="avatarWrapper"]');
        }

        // Ensure we don't attach multiple listeners
        if (avatarWrapper && !avatarWrapper.hasAttribute('data-litecord-status-listener')) {
            avatarWrapper.setAttribute('data-litecord-status-listener', 'true');

            avatarWrapper.addEventListener('contextmenu', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                // 1. Simulate left click to open the main User Popout
                avatarWrapper.click();

                // Helper to wait for an element to appear in the DOM
                const waitForElement = (selector, timeout = 1000) => {
                    return new Promise(resolve => {
                        const existing = document.querySelector(selector);
                        if (existing) return resolve(existing);

                        const observer = new MutationObserver((mutations, obs) => {
                            const found = document.querySelector(selector);
                            if (found) {
                                obs.disconnect();
                                resolve(found);
                            }
                        });
                        
                        observer.observe(document.body, { childList: true, subtree: true });
                        setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
                    });
                };

                // 2. Wait for the popout container (Element 1)
                // Supports both "userPopout" (older) and "user-profile-popout" (newer) classes
                const popout = await waitForElement('div[class*="userPopout"], div[class*="user-profile-popout"]', 500);
                
                if (popout) {
                    // 3. Find the status menu item inside the popout (Element 2)
                    // We look for a clickable menu item content that contains the status SVG mask or status class
                    const statusItems = Array.from(popout.querySelectorAll('div[role="button"], div[class*="menuItemContent"]'));
                    const targetItem = statusItems.find(el => {
                        // Check for status mask URL (e.g. #svg-mask-status-dnd) or status class
                        return el.innerHTML.includes('mask-status') || el.querySelector('div[class*="status_"]');
                    });

                    if (targetItem) {
                        // Click the status item to open the status selection menu
                        targetItem.click();
                    } else {
                         // Fallback for very old layouts: click the avatar inside the popout
                         const avatarInPopout = popout.querySelector('div[class*="avatarWrapper"]');
                         if(avatarInPopout) avatarInPopout.click();
                    }
                } else {
                    // Fallback: Check if a context menu opened directly (legacy behavior)
                    const menu = await waitForElement('div[role="menu"]', 500);
                     if (menu) {
                        const items = menu.querySelectorAll('div[role="menuitem"]');
                        for (const item of items) {
                            if (item.querySelector('div[class*="status-"]') || item.querySelector('div[class*="status_"]')) {
                                const mouseEnter = new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window });
                                item.dispatchEvent(mouseEnter);
                                break;
                            }
                        }
                     }
                }
            });
        }
    }

    // Observe body changes to re-attach if DOM refreshes
    const observer = new MutationObserver(() => {
        const userArea = document.querySelector('section[class*="panels_"]');
        if (userArea) {
            let wrapper = userArea.querySelector('div[class*="accountPopoutButtonWrapper"]');
            if (!wrapper) wrapper = userArea.querySelector('div[class*="avatarWrapper"]');
            
            if (wrapper && !wrapper.hasAttribute('data-litecord-status-listener')) {
                attachListener();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial attempt
    attachListener();
})();
