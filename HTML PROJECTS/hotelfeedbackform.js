document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
    const progressLineFill = document.querySelector('.progress-line-fill');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const successScreen = document.querySelector('.success-screen');
    const feedbackCard = document.querySelector('.feedback-card');

    let currentStep = 0;

    // Initialize Form Wizard
    updateWizard();

    // Event listeners for Navigation
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateWizard();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateWizard();
    });

    // Option Box Selection styling wrapper
    document.querySelectorAll('.option-box input').forEach(input => {
        // Init state
        if (input.checked) {
            input.closest('.option-box').classList.add('checked-state');
        }

        input.addEventListener('change', (e) => {
            const name = e.target.name;
            if (e.target.type === 'radio') {
                // Remove check state from other radios with same name
                document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                    radio.closest('.option-box').classList.remove('checked-state');
                });
            }
            if (e.target.checked) {
                e.target.closest('.option-box').classList.add('checked-state');
            } else {
                e.target.closest('.option-box').classList.remove('checked-state');
            }
        });
    });

    // First Time Stay Conditional Field Logic
    const yesOption = document.getElementById('yes-option');
    const noOption = document.getElementById('no-option');
    const conditionalField = document.getElementById('first-time-no-details');
    const priorVisitsInput = document.getElementById('prior-visits');

    function toggleConditionalField() {
        if (noOption.checked) {
            conditionalField.classList.add('show');
            priorVisitsInput.setAttribute('required', 'true');
        } else {
            conditionalField.classList.remove('show');
            priorVisitsInput.removeAttribute('required');
            priorVisitsInput.value = '';
        }
    }

    if (yesOption && noOption) {
        yesOption.addEventListener('change', toggleConditionalField);
        noOption.addEventListener('change', toggleConditionalField);
    }

    // Custom Interactive Star Ratings
    setupStarRating('service');
    setupStarRating('food');

    function setupStarRating(ratingId) {
        const wrapper = document.getElementById(`stars-${ratingId}`);
        if (!wrapper) return;

        const stars = Array.from(wrapper.querySelectorAll('.star-icon'));
        const textLabel = document.getElementById(`rating-text-${ratingId}`);
        const hiddenInput = document.getElementById(`${ratingId}-input`);

        const ratingLabels = {
            1: 'Poor',
            2: 'Satisfactory',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };

        function highlightStars(val) {
            stars.forEach(star => {
                const starVal = parseInt(star.getAttribute('data-value'));
                if (starVal <= val) {
                    star.classList.add('filled');
                } else {
                    star.classList.remove('filled');
                }
            });
        }

        // Initialize state based on default value
        const initialValue = parseInt(hiddenInput.value) || 5;
        highlightStars(initialValue);
        textLabel.textContent = ratingLabels[initialValue];

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const val = parseInt(star.getAttribute('data-value'));
                highlightStars(val);
                textLabel.textContent = ratingLabels[val];
            });

            star.addEventListener('mouseleave', () => {
                const val = parseInt(hiddenInput.value) || 0;
                highlightStars(val);
                textLabel.textContent = ratingLabels[val] || 'Select rating';
            });

            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-value'));
                hiddenInput.value = val;
                highlightStars(val);
                textLabel.textContent = ratingLabels[val];
                // Trigger input validation recalculation
                clearInvalidState(hiddenInput);
            });
        });
    }

    // Comment Field Character Counter
    const commentsArea = document.getElementById('comments');
    const charCounter = document.getElementById('comments-char-count');
    const maxChars = 500;

    if (commentsArea && charCounter) {
        commentsArea.addEventListener('input', () => {
            const length = commentsArea.value.length;
            charCounter.textContent = `${length}/${maxChars}`;

            if (length > maxChars) {
                commentsArea.value = commentsArea.value.substring(0, maxChars);
                charCounter.textContent = `${maxChars}/${maxChars}`;
            }

            if (length >= maxChars - 50) {
                charCounter.classList.add('limit-near');
            } else {
                charCounter.classList.remove('limit-near');
            }
        });
    }

    // Form Wizard Logic
    function updateWizard() {
        // Toggle Steps Visibility
        steps.forEach((step, idx) => {
            if (idx === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Toggle Progress Circles
        progressSteps.forEach((step, idx) => {
            if (idx < currentStep) {
                step.className = 'progress-step completed';
                step.innerHTML = '✓';
            } else if (idx === currentStep) {
                step.className = 'progress-step active';
                step.innerHTML = idx + 1;
            } else {
                step.className = 'progress-step';
                step.innerHTML = idx + 1;
            }
        });

        // Fill progress line
        const fillPercentage = (currentStep / (steps.length - 1)) * 100;
        progressLineFill.style.width = `${fillPercentage}%`;

        // Toggle Buttons visibility and text
        if (currentStep === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
        }

        if (currentStep === steps.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    // Client-side validation per step
    function validateStep(stepIndex) {
        const stepContainer = steps[stepIndex];
        const requiredInputs = Array.from(stepContainer.querySelectorAll('[required]'));
        let isStepValid = true;

        requiredInputs.forEach(input => {
            let isFieldValid = true;

            if (input.type === 'radio') {
                // Radio buttons need at least one checked
                const groupName = input.name;
                const checkedRadio = stepContainer.querySelector(`input[name="${groupName}"]:checked`);
                if (!checkedRadio) {
                    isFieldValid = false;
                    const groupContainer = input.closest('fieldset');
                    if (groupContainer) {
                        groupContainer.classList.add('invalid');
                    }
                } else {
                    const groupContainer = input.closest('fieldset');
                    if (groupContainer) {
                        groupContainer.classList.remove('invalid');
                    }
                }
            } else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!input.value || !emailRegex.test(input.value)) {
                    isFieldValid = false;
                    markInvalid(input);
                } else {
                    clearInvalidState(input);
                }
            } else {
                // General input / textarea / number
                if (!input.value.trim()) {
                    isFieldValid = false;
                    markInvalid(input);
                } else {
                    clearInvalidState(input);
                }
            }

            if (!isFieldValid) {
                isStepValid = false;
            }
        });

        return isStepValid;
    }

    function markInvalid(input) {
        const group = input.closest('.input-group');
        if (group) {
            group.classList.add('invalid');
        }
    }

    function clearInvalidState(input) {
        const group = input.closest('.input-group');
        if (group) {
            group.classList.remove('invalid');
        }
    }

    // Live validation cleanup on keypress
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            clearInvalidState(input);
            const parentFieldset = input.closest('fieldset');
            if (parentFieldset && parentFieldset.classList.contains('invalid')) {
                // Check if radio has selection now
                if (input.type === 'radio') {
                    const name = input.name;
                    const checkedRadio = document.querySelector(`input[name="${name}"]:checked`);
                    if (checkedRadio) {
                        parentFieldset.classList.remove('invalid');
                    }
                }
            }
        });
    });

    // Form Submission Overriding
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Final overall validation check
        let isFormValid = true;
        for (let i = 0; i < steps.length; i++) {
            if (!validateStep(i)) {
                currentStep = i;
                updateWizard();
                isFormValid = false;
                break;
            }
        }

        if (!isFormValid) return;

        // Perform Submitting overlay animation
        loadingOverlay.classList.add('active');

        // Simulate network latency (1.8s)
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            
            // Transform form card to success state
            form.style.display = 'none';
            document.querySelector('header').style.display = 'none';
            successScreen.classList.add('active');
            
            // Create nice confetti shower
            createConfettiExplosion();
        }, 1800);
    });

    // Reset Form Event
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            form.reset();
            
            // Reset option box styling
            document.querySelectorAll('.option-box').forEach(box => {
                box.classList.remove('checked-state');
            });
            // Re-check defaults
            document.querySelectorAll('.option-box input').forEach(input => {
                if (input.checked) {
                    input.closest('.option-box').classList.add('checked-state');
                }
            });

            // Hide conditional field
            conditionalField.classList.remove('show');
            priorVisitsInput.removeAttribute('required');

            // Reset custom ratings to default (5 stars = Excellent)
            const hiddenInputs = ['service', 'food'];
            hiddenInputs.forEach(id => {
                const hiddenInput = document.getElementById(`${id}-input`);
                if (hiddenInput) {
                    hiddenInput.value = 5;
                    const wrapper = document.getElementById(`stars-${id}`);
                    if (wrapper) {
                        const stars = wrapper.querySelectorAll('.star-icon');
                        stars.forEach(star => star.classList.add('filled'));
                        const textLabel = document.getElementById(`rating-text-${id}`);
                        if (textLabel) textLabel.textContent = 'Excellent';
                    }
                }
            });

            // Reset comment counter
            if (charCounter) charCounter.textContent = `0/${maxChars}`;

            // Reset step count
            currentStep = 0;
            updateWizard();

            // Toggle screens
            successScreen.classList.remove('active');
            form.style.display = 'block';
            document.querySelector('header').style.display = 'block';
        });
    }

    // Confetti generator function
    function createConfettiExplosion() {
        const colors = ['#6366f1', '#a855f7', '#10b981', '#fbbf24', '#f43f5e', '#3b82f6'];
        const cardRect = feedbackCard.getBoundingClientRect();
        
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            feedbackCard.appendChild(confetti);

            // Starting point is the checkmark center
            const startX = cardRect.width / 2;
            const startY = 120; // estimate vertical position of checkmark

            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 200;
            const destX = startX + Math.cos(angle) * distance;
            const destY = startY + Math.sin(angle) * distance + (Math.random() * 100); // add gravity drop

            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 6 + Math.random() * 8;
            const rotation = Math.random() * 360;

            confetti.style.left = `${startX}px`;
            confetti.style.top = `${startY}px`;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.background = color;
            confetti.style.transform = `rotate(${rotation}deg)`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.opacity = '1';

            // Animation
            confetti.animate([
                {
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 1
                },
                {
                    transform: `translate(${destX - startX}px, ${destY - startY}px) rotate(${rotation + 720}deg)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 1500,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                fill: 'forwards'
            });

            // Cleanup
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
});
