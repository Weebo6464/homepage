
function getErrorInfo() {
    const resultSummary = document.getElementById('result-summary');
    const resultDescription = document.getElementById('result-description');
    const errorInput = document.getElementById('error-input');

    const errorCode = errorInput.value.trim();
    if (!errorCode) {
        resultSummary.innerHTML = '<p>Please enter an error code.</p>';
        resultDescription.classList.remove('show');
        return;
    }

    fetch('./ErrorCodes.json')
        .then(response => response.json())
        .then(data => {
            const matches = data.filter(item => new RegExp(item.regex).test(errorCode));
            
            if (matches.length > 0) {
                const specificMatch = matches[matches.length - 1];        

                resultSummary.innerHTML = `<h3>Error Code ${errorCode}: ${specificMatch.comment}</h3>`;
                resultDescription.innerHTML = `<p><strong>Description:</strong> ${parseDescription(specificMatch.description)}</p>`;
                resultDescription.classList.add('show');
            } else {
                resultSummary.innerHTML = `<p>No information found for error code ${errorCode}.</p>`;
                resultDescription.classList.remove('show');
            }
        })
        .catch(error => {
            console.error('Error fetching error codes:', error);
            resultSummary.innerHTML = `<p>Failed to load error codes. Please try again later.</p>`;
            resultDescription.classList.remove('show');
        });
}

function parseDescription(description) {
    // Handle cases where description is not provided or empty
    if (!description) {
        return "Not available.";
    }

    // Ensure we are working with an array for consistent processing
    const descriptions = Array.isArray(description) ? description : [description];

    if (descriptions.length === 0) {
        return "Not available.";
    }

    // Join the descriptions with line breaks
    return descriptions.join('<br><br>');
}

document.addEventListener('DOMContentLoaded', () => {
    const errorInput = document.getElementById('error-input');
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', getErrorInfo);

    errorInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            getErrorInfo();
        }
    });

});