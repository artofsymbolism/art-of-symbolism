// Initialize AOS (if not already initialized in HTML)
if (typeof AOS !== 'undefined') {
  AOS.init();
}

// Generate a random math question for the CAPTCHA
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
  const num2 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
  document.getElementById('captchaQuestion').textContent = `What is ${num1} + ${num2}?`;
  return num1 + num2; // Correct answer
}

// Initialize CAPTCHA
let correctCaptchaAnswer = generateCaptcha();

// Verify the CAPTCHA answer
document.getElementById('verifyCaptchaBtn').addEventListener('click', () => {
  const userAnswer = parseInt(document.getElementById('captchaAnswer').value, 10);
  const captchaError = document.getElementById('captchaError');
  if (userAnswer === correctCaptchaAnswer) {
    document.getElementById('captchaContainer').style.display = 'none'; // Hide CAPTCHA
    document.getElementById('analyzeBtn').disabled = false; // Enable the analyze button
  } else {
    captchaError.style.display = 'block'; // Show error message
    correctCaptchaAnswer = generateCaptcha(); // Generate a new CAPTCHA
    document.getElementById('captchaAnswer').value = ''; // Clear the input
  }
});

// Initially disable the analyze button
document.getElementById('analyzeBtn').disabled = true;

// Function to display the analysis results
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const loader = document.getElementById('loader');
  loader.style.display = 'none'; // Hide loader
  resultsDiv.innerHTML = '';

  if (data.error) {
    resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
    return;
  }

  const resultContent = `
    <h2>Analysis Result</h2>
    <p>${data.result}</p>
  `;
  resultsDiv.innerHTML = resultContent;
}

// Function to send image data to the backend for analysis
function analyzeImage(base64Image) {
  const backendUrl = 'https://art-of-symbolism.onrender.com/analyze-image'; // Update if necessary

  const analyzeBtn = document.getElementById('analyzeBtn');
  const loader = document.getElementById('loader');
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  loader.style.display = 'block'; // Show loader
  analyzeBtn.disabled = true; // Disable button during analysis
  analyzeBtn.classList.remove('enabled');

  axios.post(backendUrl, { base64Image })
    .then(response => {
      displayResults(response.data);
      analyzeBtn.disabled = false; // Re-enable button
      analyzeBtn.classList.add('enabled');
    })
    .catch(err => {
      console.error('Error:', err);
      loader.style.display = 'none'; // Hide loader
      analyzeBtn.disabled = false; // Re-enable button
      analyzeBtn.classList.add('enabled');
      alert('An error occurred while analyzing the image.');
    });
}

// Event Listener for Image Analysis Page
if (document.getElementById('imageFile')) {
  const imageFileInput = document.getElementById('imageFile');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const imagePreview = document.getElementById('imagePreview');

  imageFileInput.addEventListener('change', () => {
    const imageFile = imageFileInput.files[0];

    if (imageFile) {
      analyzeBtn.disabled = false; // Enable analyze button
      analyzeBtn.classList.add('enabled');

      const reader = new FileReader();
      reader.onload = function(event) {
        const base64Image = event.target.result.split(',')[1]; // Base64 encoded string

        // Show image preview
        imagePreview.innerHTML = `<img src="${event.target.result}" alt="Image Preview">`;

        // Store the base64Image for analysis
        analyzeBtn.onclick = function() {
          analyzeImage(base64Image);
        };
      };
      reader.readAsDataURL(imageFile);
    } else {
      analyzeBtn.disabled = true; // Disable analyze button
      analyzeBtn.classList.remove('enabled');
      imagePreview.innerHTML = '';
    }
  });
}

// Smooth Scrolling for Anchor Links (Optional)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();

    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Additional Scripts (if any)
// You can add more JavaScript functions here as needed.
