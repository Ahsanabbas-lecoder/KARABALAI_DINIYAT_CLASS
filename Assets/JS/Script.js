document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('admissionForm');
    const result = document.getElementById('result');
    
    // Photo preview functionality
    const photoInput = document.getElementById('candidatePhoto');
    const photoPreview = document.getElementById('photoPreview');
    
    if (photoInput && photoPreview) {
        photoInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Photo size should be less than 2MB');
                    this.value = '';
                    photoPreview.innerHTML = '<span class="text-muted">Preview will appear here</span>';
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Candidate Photo Preview">`;
                }
                
                reader.onerror = function() {
                    photoPreview.innerHTML = '<span class="text-danger">Error loading image</span>';
                }
                
                reader.readAsDataURL(file);
            } else {
                photoPreview.innerHTML = '<span class="text-muted">Preview will appear here</span>';
            }
        });
    }
    
    // Form submission handler
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            submitBtn.disabled = true;
            
            // Create FormData object
            const formData = new FormData(form);
            
            // Submit form using fetch API
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    result.innerHTML = 'Thank you! Your application has been submitted successfully.';
                    result.className = 'mt-3 text-center success';
                    result.style.display = 'block';
                    form.reset();
                    photoPreview.innerHTML = '<span class="text-muted">Preview will appear here</span>';
                } else {
                    throw new Error(data.message || 'Submission failed');
                }
            })
            .catch(error => {
                result.innerHTML = 'Error: ' + error.message;
                result.className = 'mt-3 text-center error';
                result.style.display = 'block';
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Scroll to result message
                result.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Check required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value) {
                isValid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        // Check radio buttons
        const radioGroups = form.querySelectorAll('input[type="radio"][required]');
        radioGroups.forEach(group => {
            const name = group.name;
            const checked = form.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
                const firstRadio = form.querySelector(`input[name="${name}"]`);
                firstRadio.classList.add('is-invalid');
            } else {
                const radios = form.querySelectorAll(`input[name="${name}"]`);
                radios.forEach(radio => radio.classList.remove('is-invalid'));
            }
        });
        
        if (!isValid) {
            result.innerHTML = 'Please fill all required fields correctly.';
            result.className = 'mt-3 text-center error';
            result.style.display = 'block';
            return false;
        }
        
        return true;
    }
    
    // Reset form handler
    const resetBtn = form.querySelector('[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            photoPreview.innerHTML = '<span class="text-muted">Preview will appear here</span>';
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            result.style.display = 'none';
        });
    }
});