document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('suggestionForm');
    const responseMessage = document.getElementById('responseMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            type: document.getElementById('suggestionType').value,
            suggestion: document.getElementById('suggestion').value.trim(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        // Basic validation
        if (!formData.type) {
            showResponse('Please select a suggestion type', 'error');
            return;
        }

        if (!formData.suggestion) {
            showResponse('Please enter your suggestion', 'error');
            return;
        }

        try {
            // In a real application, you would send this to a server endpoint
            // For this example, we'll simulate saving to a JSON file
            const response = await saveSuggestion(formData);
            
            if (response.success) {
                showResponse('Thank you for your suggestion! We appreciate your feedback.', 'success');
                form.reset();
            } else {
                showResponse('There was an error submitting your suggestion. Please try again later.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showResponse('An unexpected error occurred. Please try again later.', 'error');
        }
    });

    // Function to show response message
    function showResponse(message, type = 'info') {
        responseMessage.textContent = message;
        responseMessage.className = 'response-message';
        responseMessage.classList.add(type);
        responseMessage.style.display = 'block';
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            responseMessage.style.opacity = '0';
            setTimeout(() => {
                responseMessage.style.display = 'none';
                responseMessage.style.opacity = '1';
            }, 500);
        }, 5000);
    }

    // Simulate saving to a JSON file
    async function saveSuggestion(data) {
        // In a real application, you would send this to a server
        // For this example, we'll log it to the console
        console.log('Saving suggestion:', data);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would have server-side code to handle this
        // For now, we'll just return a success response
        return {
            success: true,
            message: 'Suggestion received',
            data: data
        };
    }
});
