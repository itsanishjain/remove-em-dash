// Content script to intercept ChatGPT copy buttons and remove em dashes
(function() {
    'use strict';
    
    console.log('🎬 INITIALIZING EM DASH REMOVER...');
    
    // Function to clean text by removing em dashes
    function cleanText(text) {
        console.log('🔧 ORIGINAL TEXT:', JSON.stringify(text));
        
        // Count em dashes before removal
        const emDashMatches = text.match(/—/g);
        const emDashCount = emDashMatches ? emDashMatches.length : 0;
        console.log('🔧 EM DASHES FOUND:', emDashCount, 'matches:', emDashMatches);
        
        const cleaned = text.replace(/—/g, ''); // Remove em dashes
            
        console.log('🔧 CLEANED TEXT:', JSON.stringify(cleaned));
        console.log('🔧 EM DASHES REMOVED:', emDashCount);
        
        return cleaned;
    }
    
    // Intercept clipboard writeText calls
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = function(text) {
        console.log('📋 CLIPBOARD WRITETEXT INTERCEPTED!');
        console.log('📋 ORIGINAL TEXT:', JSON.stringify(text));
        
        if (text && text.includes('—')) {
            console.log('📋 EM DASH DETECTED! CLEANING TEXT...');
            const cleanedText = cleanText(text);
            console.log('✅ WRITING CLEANED TEXT TO CLIPBOARD');
            return originalWriteText.call(this, cleanedText);
        } else {
            console.log('📋 NO EM DASHES, WRITING ORIGINAL TEXT');
            return originalWriteText.call(this, text);
        }
    };
    
    console.log('✅ EM DASH REMOVER LOADED AND READY!');
})();