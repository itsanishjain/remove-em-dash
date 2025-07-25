// Content script to intercept ChatGPT copy buttons and remove em dashes
(function() {
    'use strict';
    
    console.log('🎬 INITIALIZING EM DASH REMOVER EXTENSION...');
    console.log('🎬 TARGET: ChatGPT Copy Buttons');
    
    // DEBUG MODE - Set to true to test extension on ANY text (not just em dashes)
    const DEBUG_MODE = true;
    console.log('🐛 DEBUG MODE:', DEBUG_MODE ? 'ENABLED (will trigger on ANY copy)' : 'DISABLED (only em dashes)');
    
    // Multiple selectors for copy buttons (ChatGPT UI changes frequently)
    const COPY_BUTTON_SELECTORS = [
        '[data-testid="copy-turn-action-button"]',
        'button[aria-label*="Copy"]',
        'button[title*="Copy"]',
        '.copy-button',
        'button:has(svg[data-icon="copy"])',
        'button:has([data-icon="copy"])',
        'button[class*="copy"]'
    ];
    
    // Function to clean text by removing em dashes
    function cleanText(text) {
        console.log('🔧 CLEANING TEXT FUNCTION CALLED');
        console.log('🔧 ORIGINAL TEXT LENGTH:', text.length);
        console.log('🔧 ORIGINAL TEXT:', JSON.stringify(text.substring(0, 200) + (text.length > 200 ? '...' : '')));
        
        // Count em dashes before removal
        const emDashMatches = text.match(/—/g);
        const emDashCount = emDashMatches ? emDashMatches.length : 0;
        console.log('🔧 EM DASHES FOUND:', emDashCount);
        if (emDashCount > 0) {
            console.log('🔧 EM DASH POSITIONS:', emDashMatches);
        }
        
        const cleaned = text.replace(/—/g, ''); // Remove em dashes
        
        console.log('🔧 CLEANED TEXT LENGTH:', cleaned.length);
        console.log('🔧 CLEANED TEXT:', JSON.stringify(cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '')));
        console.log('🔧 EM DASHES REMOVED:', emDashCount);
        console.log('🔧 TEXT CLEANING COMPLETE');
        
        return cleaned;
    }
    
    // Function to get the text content from ChatGPT response
    function getResponseText(button) {
        console.log('📝 GETTING RESPONSE TEXT FROM BUTTON...');
        console.log('📝 BUTTON ELEMENT:', button);
        
        // Strategy 1: Try to find message container with various selectors
        const messageContainerSelectors = [
            '[data-message-author-role]',
            '[data-message-id]',
            '.group',
            '.flex.w-full',
            '.message',
            '.conversation-turn'
        ];
        
        let messageContainer = null;
        for (const selector of messageContainerSelectors) {
            messageContainer = button.closest(selector);
            console.log(`📝 TRYING MESSAGE CONTAINER SELECTOR "${selector}":`, messageContainer ? 'FOUND' : 'NOT FOUND');
            if (messageContainer) break;
        }
        
        let textElement = null;
        let text = '';
        
        if (messageContainer) {
            console.log('📝 MESSAGE CONTAINER FOUND:', messageContainer);
            
            // Look for the text content in various possible selectors within the container
            const textSelectors = [
                '.markdown.prose',
                '.markdown',
                '[data-message-content]',
                '.prose',
                'div[class*="markdown"]',
                'div[class*="prose"]',
                '.whitespace-pre-wrap',
                'p',
                'div'
            ];
            
            for (const selector of textSelectors) {
                textElement = messageContainer.querySelector(selector);
                console.log(`📝 TRYING TEXT SELECTOR "${selector}":`, textElement ? 'FOUND' : 'NOT FOUND');
                if (textElement) {
                    text = textElement.innerText || textElement.textContent || '';
                    if (text.trim().length > 0) break;
                }
            }
            
            // If still no text, try the container itself
            if (!text.trim()) {
                console.log('📝 FALLING BACK TO MESSAGE CONTAINER TEXT');
                text = messageContainer.innerText || messageContainer.textContent || '';
            }
        }
        
        // Strategy 2: If no message container found, try to find text near the button
        if (!text.trim()) {
            console.log('📝 STRATEGY 2: SEARCHING NEAR BUTTON...');
            
            // Try parent elements
            let parent = button.parentElement;
            let attempts = 0;
            while (parent && attempts < 10) {
                const parentText = parent.innerText || parent.textContent || '';
                if (parentText.trim().length > 50) { // Reasonable text length
                    console.log(`📝 FOUND TEXT IN PARENT ${attempts + 1}:`, parent);
                    text = parentText;
                    break;
                }
                parent = parent.parentElement;
                attempts++;
            }
        }
        
        // Strategy 3: Try to find any text content in the page that looks like a ChatGPT response
        if (!text.trim()) {
            console.log('📝 STRATEGY 3: SEARCHING FOR ANY RESPONSE TEXT...');
            
            const possibleTextElements = document.querySelectorAll(
                '.markdown, .prose, [class*="markdown"], [class*="prose"], .whitespace-pre-wrap'
            );
            
            for (const element of possibleTextElements) {
                const elementText = element.innerText || element.textContent || '';
                if (elementText.trim().length > 50) {
                    console.log('📝 FOUND POSSIBLE TEXT ELEMENT:', element);
                    text = elementText;
                    break;
                }
            }
        }
        
        // Clean up the text (remove button text, etc.)
        if (text) {
            // Remove common button text that might be included
            text = text.replace(/Copy code|Copy|Copied!/g, '').trim();
        }
        
        console.log('📝 FINAL EXTRACTED TEXT LENGTH:', text.length);
        console.log('📝 FINAL EXTRACTED TEXT PREVIEW:', JSON.stringify(text.substring(0, 200) + (text.length > 200 ? '...' : '')));
        
        return text.length > 0 ? text : null;
    }
    
    // Function to handle copy button click
    function handleCopyClick(event) {
        console.log('🚀 COPY BUTTON CLICKED!');
        console.log('🚀 EVENT:', event);
        console.log('🚀 TARGET BUTTON:', event.target);
        
        const button = event.currentTarget;
        console.log('🚀 CURRENT TARGET:', button);
        
        // ALWAYS prevent default first to ensure we intercept the copy
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Get the text to copy
        const originalText = getResponseText(button);
        
        if (!originalText) {
            console.error('❌ NO TEXT FOUND TO COPY');
            // Fallback: try to get text from clipboard or let original behavior proceed
            return;
        }
        
        console.log('🚀 ORIGINAL TEXT OBTAINED, LENGTH:', originalText.length);
        
        // Check if text contains em dashes (or if in debug mode, trigger on any text)
        const hasEmDashes = originalText.includes('—');
        const shouldProcess = DEBUG_MODE || hasEmDashes;
        
        console.log('🚀 EM DASHES DETECTED:', hasEmDashes);
        console.log('🚀 SHOULD PROCESS (debug or em dashes):', shouldProcess);
        
        let textToCopy = originalText;
        
        if (shouldProcess) {
            console.log('🚀 PROCESSING TEXT! CLEANING...');
            textToCopy = cleanText(originalText);
        } else {
            console.log('🚀 NO PROCESSING NEEDED, COPYING ORIGINAL TEXT');
            console.log('🚀 REASON: DEBUG_MODE =', DEBUG_MODE, ', HAS_EM_DASHES =', hasEmDashes);
        }
        
        // Copy the text to clipboard
        console.log('📋 COPYING TEXT TO CLIPBOARD...');
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log('✅ TEXT SUCCESSFULLY COPIED TO CLIPBOARD!');
                console.log('✅ OPERATION COMPLETE');
                
                // Visual feedback - briefly highlight the button
                button.style.backgroundColor = '#22c55e';
                setTimeout(() => {
                    button.style.backgroundColor = '';
                }, 200);
            })
            .catch(err => {
                console.error('❌ FAILED TO COPY TO CLIPBOARD:', err);
                console.log('🔄 TRYING FALLBACK COPY METHOD...');
                
                // Fallback using older clipboard API
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    console.log('✅ FALLBACK COPY SUCCESSFUL!');
                } catch (fallbackErr) {
                    console.error('❌ FALLBACK COPY ALSO FAILED:', fallbackErr);
                }
            });
    }
    
    // Function to attach event listeners to copy buttons
    function attachCopyListeners() {
        console.log('🔍 SEARCHING FOR COPY BUTTONS...');
        
        let totalButtons = 0;
        let newButtons = 0;
        
        // Try all possible selectors
        COPY_BUTTON_SELECTORS.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            if (buttons.length > 0) {
                console.log(`🔍 FOUND ${buttons.length} BUTTONS WITH SELECTOR: ${selector}`);
            }
            
            buttons.forEach((button, index) => {
                totalButtons++;
                
                // Check if already has our listener
                if (button.hasAttribute('data-em-dash-listener')) {
                    return;
                }
                
                console.log(`🔗 ATTACHING LISTENER TO BUTTON:`, button);
                
                // Add multiple event listeners to ensure we catch the click
                button.addEventListener('click', handleCopyClick, true); // Capture phase
                button.addEventListener('click', handleCopyClick, false); // Bubble phase
                button.addEventListener('mousedown', handleCopyClick, true); // Even earlier
                
                button.setAttribute('data-em-dash-listener', 'true');
                newButtons++;
                console.log(`✅ ATTACHED LISTENERS TO BUTTON`);
            });
        });
        
        console.log(`🔗 FINISHED: ${totalButtons} total buttons found, ${newButtons} new listeners attached`);
    }
    
    // Function to observe DOM changes and attach listeners to new buttons
    function startObserver() {
        console.log('👁️ STARTING DOM OBSERVER...');
        
        const observer = new MutationObserver((mutations) => {
            let shouldCheckButtons = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain copy buttons
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node itself is a copy button or contains copy buttons
                            const hasButton = COPY_BUTTON_SELECTORS.some(selector => {
                                return node.matches && node.matches(selector) || 
                                       node.querySelector && node.querySelector(selector);
                            });
                            if (hasButton) {
                                shouldCheckButtons = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheckButtons) {
                console.log('👁️ NEW COPY BUTTONS DETECTED, ATTACHING LISTENERS...');
                // Small delay to ensure elements are fully rendered
                setTimeout(attachCopyListeners, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-testid', 'aria-label', 'title', 'class']
        });
        
        console.log('👁️ DOM OBSERVER STARTED');
        
        // Also periodically check for buttons (fallback)
        setInterval(() => {
            console.log('🔄 PERIODIC BUTTON CHECK...');
            attachCopyListeners();
        }, 3000);
    }
    
    // Initialize the extension
    function initialize() {
        console.log('🚀 INITIALIZING EXTENSION...');
        
        // Initial attachment
        attachCopyListeners();
        
        // Start observing for new buttons
        startObserver();
        
        console.log('✅ EM DASH REMOVER EXTENSION FULLY LOADED AND READY!');
        console.log('✅ MONITORING FOR COPY BUTTON CLICKS...');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        console.log('⏳ DOM STILL LOADING, WAITING...');
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        console.log('⏳ DOM ALREADY READY, INITIALIZING IMMEDIATELY...');
        initialize();
    }
    
})();