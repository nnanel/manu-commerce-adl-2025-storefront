/**
 * Product Ratings Utility
 * Fetches and displays product ratings from the Ratings API
 */

const RATINGS_API_URL = 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';

// Cache configuration
const CACHE_KEY_PREFIX = 'productRatings_';
const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

/**
 * Get cached rating from sessionStorage
 * @param {string} sku - Product SKU
 * @returns {Object|null} Cached rating data or null if not found/expired
 */
function getCachedRating(sku) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + sku;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (less than 2 minutes old)
    if (now - timestamp < CACHE_DURATION_MS) {
      return data;
    }
    
    // Cache expired, remove it
    sessionStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.warn('Error reading from cache:', error);
    return null;
  }
}

/**
 * Save rating to sessionStorage cache
 * @param {string} sku - Product SKU
 * @param {Object} data - Rating data to cache
 */
function setCachedRating(sku, data) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + sku;
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache() {
  try {
    const now = Date.now();
    const keysToRemove = [];
    
    // Find expired entries
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const cached = sessionStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (now - timestamp >= CACHE_DURATION_MS) {
            keysToRemove.push(key);
          }
        }
      }
    }
    
    // Remove expired entries
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.warn('Error cleaning up cache:', error);
  }
}

/**
 * Fetch product rating from the Ratings API with pagination and sorting support
 * @param {string} sku - Product SKU
 * @param {number} page - Page number (default: 1)
 * @param {number|string} limit - Reviews per page (default: 5) or "all" for all reviews
 * @param {string} sortBy - Sort field: 'date' or 'rating' (default: 'date')
 * @param {string} sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object|null>} Rating data or null on error
 */
export async function fetchProductRating(sku, page = 1, limit = 5, sortBy = 'date', sortOrder = 'desc') {
  if (!sku) {
    console.warn('fetchProductRating: SKU is required');
    return null;
  }

  // Check cache first (only for page 1 with default limit and default sorting)
  // Don't use cache for "all" limit
  if (page === 1 && limit === 5 && sortBy === 'date' && sortOrder === 'desc') {
    const cached = getCachedRating(sku);
    if (cached) {
      return cached;
    }
  }

  try {
    const url = new URL(RATINGS_API_URL);
    url.searchParams.set('sku', sku);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', typeof limit === 'string' ? limit : limit.toString());
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', sortOrder);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Failed to fetch rating for SKU: ${sku}, Status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`Rating API error for SKU: ${sku}:`, data.error);
      return null;
    }
    
    // Cache the result in sessionStorage with timestamp (only for page 1 with default limit and default sorting)
    if (page === 1 && limit === 5 && sortBy === 'date' && sortOrder === 'desc') {
      setCachedRating(sku, data);
      // Periodically clean up expired cache entries
      cleanupExpiredCache();
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching rating for SKU: ${sku}:`, error);
    return null;
  }
}

/**
 * Create a star rating element
 * @param {number} rating - Rating value (1-5)
 * @param {number} totalCount - Total number of ratings
 * @param {object} distribution - Optional distribution data for modal
 * @param {Array} reviews - Optional reviews array for modal
 * @param {string} sku - Optional SKU for loading more reviews
 * @param {object} paginationData - Optional pagination metadata
 * @returns {HTMLElement} Rating element
 */
export function createRatingElement(rating, totalCount, distribution = null, reviews = [], sku = null, paginationData = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-rating';
  
  const starsWrapper = document.createElement('div');
  starsWrapper.className = 'product-rating__stars';
  starsWrapper.setAttribute('aria-label', `${rating} out of 5 stars`);
  starsWrapper.setAttribute('role', 'img');
  
  // Create filled and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Add filled stars
  for (let i = 0; i < fullStars; i++) {
    const star = document.createElement('span');
    star.className = 'product-rating__star product-rating__star--filled';
    star.textContent = '★';
    star.setAttribute('aria-hidden', 'true');
    starsWrapper.appendChild(star);
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    const star = document.createElement('span');
    star.className = 'product-rating__star product-rating__star--half';
    star.textContent = '★';
    star.setAttribute('aria-hidden', 'true');
    starsWrapper.appendChild(star);
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    const star = document.createElement('span');
    star.className = 'product-rating__star product-rating__star--empty';
    star.textContent = '☆';
    star.setAttribute('aria-hidden', 'true');
    starsWrapper.appendChild(star);
  }
  
  wrapper.appendChild(starsWrapper);
  
  // Add rating value and count
  const info = document.createElement('div');
  info.className = 'product-rating__info';
  
  const value = document.createElement('span');
  value.className = 'product-rating__value';
  value.textContent = rating.toFixed(1);
  info.appendChild(value);
  
  // Make count clickable if distribution data is available
  if (distribution) {
    const countLink = document.createElement('button');
    countLink.className = 'product-rating__count product-rating__count--link';
    countLink.textContent = `(${totalCount})`;
    countLink.setAttribute('type', 'button');
    countLink.setAttribute('aria-label', `View rating distribution for ${totalCount} reviews`);
    countLink.addEventListener('click', () => {
      openRatingDistributionModal(rating, totalCount, distribution, reviews, sku, paginationData);
    });
    info.appendChild(countLink);
  } else {
    const count = document.createElement('span');
    count.className = 'product-rating__count';
    count.textContent = `(${totalCount})`;
    info.appendChild(count);
  }
  
  wrapper.appendChild(info);
  
  return wrapper;
}

/**
 * Add rating to a product element
 * @param {HTMLElement} productElement - The product container element
 * @param {string} sku - Product SKU
 * @param {HTMLElement} insertAfter - Element to insert rating after
 * @returns {Promise<HTMLElement|null>} Rating element or null
 */
export async function addRatingToProduct(productElement, sku, insertAfter = null) {
  if (!productElement || !sku) {
    return null;
  }

  const ratingData = await fetchProductRating(sku);
  
  if (!ratingData) {
    return null;
  }

  const ratingElement = createRatingElement(
    ratingData.averageRating,
    ratingData.totalCount,
  );

  if (insertAfter && insertAfter.parentNode) {
    insertAfter.parentNode.insertBefore(ratingElement, insertAfter.nextSibling);
  } else {
    productElement.appendChild(ratingElement);
  }

  return ratingElement;
}

/**
 * Create rating distribution histogram
 * @param {object} distribution - Distribution object {1: count, 2: count, ...}
 * @param {number} totalCount - Total number of ratings
 * @returns {HTMLElement} Distribution element
 */
export function createRatingDistribution(distribution, totalCount) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-rating__distribution';
  wrapper.setAttribute('role', 'group');
  wrapper.setAttribute('aria-label', 'Rating distribution');

  // Handle no ratings case
  if (!totalCount || totalCount === 0) {
    const noRatings = document.createElement('div');
    noRatings.className = 'product-rating__distribution-empty';
    noRatings.textContent = 'No ratings yet';
    wrapper.appendChild(noRatings);
    return wrapper;
  }

  // Create rows for stars 5 down to 1
  for (let star = 5; star >= 1; star -= 1) {
    const count = distribution?.[star] || 0;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

    const row = document.createElement('div');
    row.className = 'product-rating__distribution-row';

    // Star label
    const label = document.createElement('div');
    label.className = 'product-rating__distribution-label';
    const starIcon = document.createElement('span');
    starIcon.className = 'product-rating__star product-rating__star--filled';
    starIcon.textContent = '★';
    starIcon.setAttribute('aria-hidden', 'true');
    label.innerHTML = `${star} `;
    label.appendChild(starIcon);

    // Progress bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'product-rating__distribution-bar-container';

    const bar = document.createElement('div');
    bar.className = 'product-rating__distribution-bar';
    // Ensure minimum visibility for very small percentages
    const barWidth = percentage > 0 && percentage < 1 ? 1 : Math.round(percentage);
    bar.style.width = `${barWidth}%`;
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', barWidth.toString());
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-label', `${count} ${star}-star ratings, ${barWidth}% of total`);

    barContainer.appendChild(bar);

    // Count
    const countElement = document.createElement('div');
    countElement.className = 'product-rating__distribution-count';
    countElement.textContent = count;

    row.appendChild(label);
    row.appendChild(barContainer);
    row.appendChild(countElement);
    wrapper.appendChild(row);
  }

  return wrapper;
}

/**
 * Create reviews list
 * @param {Array} reviews - Array of review objects
 * @returns {HTMLElement} Reviews list element
 */
export function createReviewsList(reviews) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-rating__reviews';

  if (!reviews || reviews.length === 0) {
    const noReviews = document.createElement('div');
    noReviews.className = 'product-rating__reviews-empty';
    noReviews.textContent = 'No reviews yet. Be the first to write one!';
    wrapper.appendChild(noReviews);
    return wrapper;
  }

  // Reviews header
  const header = document.createElement('div');
  header.className = 'product-rating__reviews-header';

  const title = document.createElement('h3');
  title.className = 'product-rating__reviews-title';
  title.textContent = 'Recent Reviews';
  header.appendChild(title);

  wrapper.appendChild(header);

  // Individual reviews
  reviews.forEach((review) => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'product-rating__review';

    // Review header (stars, name, date)
    const reviewHeader = document.createElement('div');
    reviewHeader.className = 'product-rating__review-header';

    // Stars
    const stars = document.createElement('div');
    stars.className = 'product-rating__review-stars';
    stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
    stars.setAttribute('role', 'img');

    for (let i = 0; i < 5; i += 1) {
      const star = document.createElement('span');
      star.className = `product-rating__star ${i < review.rating ? 'product-rating__star--filled' : 'product-rating__star--empty'}`;
      star.textContent = i < review.rating ? '★' : '☆';
      star.setAttribute('aria-hidden', 'true');
      stars.appendChild(star);
    }

    reviewHeader.appendChild(stars);

    // Review meta (name and date)
    const meta = document.createElement('div');
    meta.className = 'product-rating__review-meta';

    const name = document.createElement('span');
    name.className = 'product-rating__review-name';
    name.textContent = review.name;

    const date = document.createElement('span');
    date.className = 'product-rating__review-date';
    date.textContent = formatReviewDate(review.date);

    meta.appendChild(name);
    meta.appendChild(date);

    reviewHeader.appendChild(meta);
    reviewElement.appendChild(reviewHeader);

    // Review comment
    const comment = document.createElement('div');
    comment.className = 'product-rating__review-comment';
    comment.textContent = review.comment;

    reviewElement.appendChild(comment);
    wrapper.appendChild(reviewElement);
  });

  return wrapper;
}

/**
 * Format review date for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatReviewDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    // Format as "Month Day, Year" for older dates
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    return dateString;
  }
}

/**
 * Create review submission form
 * @returns {object} Object with form element and selected rating value
 */
function createReviewForm() {
  const form = document.createElement('form');
  form.className = 'review-form';

  // Form title
  const title = document.createElement('h3');
  title.className = 'review-form__title';
  title.textContent = 'Write Your Review';
  form.appendChild(title);

  // Star rating selector
  const ratingSection = document.createElement('div');
  ratingSection.className = 'review-form__rating-section';

  const ratingLabel = document.createElement('label');
  ratingLabel.className = 'review-form__label';
  ratingLabel.textContent = 'Your Rating *';
  ratingSection.appendChild(ratingLabel);

  const starsContainer = document.createElement('div');
  starsContainer.className = 'review-form__stars';
  starsContainer.setAttribute('role', 'radiogroup');
  starsContainer.setAttribute('aria-label', 'Select your rating');

  let selectedRating = 0;

  // Create interactive star buttons
  for (let i = 1; i <= 5; i += 1) {
    const starButton = document.createElement('button');
    starButton.type = 'button';
    starButton.className = 'review-form__star';
    starButton.textContent = '☆';
    starButton.setAttribute('data-rating', i.toString());
    starButton.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    
    starButton.addEventListener('click', () => {
      selectedRating = i;
      // Update all stars
      starsContainer.querySelectorAll('.review-form__star').forEach((star, index) => {
        if (index < i) {
          star.textContent = '★';
          star.classList.add('review-form__star--selected');
        } else {
          star.textContent = '☆';
          star.classList.remove('review-form__star--selected');
        }
      });
    });

    // Hover effect
    starButton.addEventListener('mouseenter', () => {
      starsContainer.querySelectorAll('.review-form__star').forEach((star, index) => {
        if (index < i) {
          star.classList.add('review-form__star--hover');
        } else {
          star.classList.remove('review-form__star--hover');
        }
      });
    });

    starsContainer.addEventListener('mouseleave', () => {
      starsContainer.querySelectorAll('.review-form__star').forEach((star) => {
        star.classList.remove('review-form__star--hover');
      });
    });

    starsContainer.appendChild(starButton);
  }

  ratingSection.appendChild(starsContainer);
  form.appendChild(ratingSection);

  // Name input
  const nameSection = document.createElement('div');
  nameSection.className = 'review-form__field';

  const nameLabel = document.createElement('label');
  nameLabel.className = 'review-form__label';
  nameLabel.htmlFor = 'review-name';
  nameLabel.textContent = 'Your Name *';
  nameSection.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'review-name';
  nameInput.className = 'review-form__input';
  nameInput.placeholder = 'Enter your name';
  nameInput.required = true;
  nameInput.maxLength = 50;
  nameSection.appendChild(nameInput);

  form.appendChild(nameSection);

  // Review text area
  const reviewSection = document.createElement('div');
  reviewSection.className = 'review-form__field';

  const reviewLabel = document.createElement('label');
  reviewLabel.className = 'review-form__label';
  reviewLabel.htmlFor = 'review-text';
  reviewLabel.textContent = 'Your Review *';
  reviewSection.appendChild(reviewLabel);

  const reviewTextarea = document.createElement('textarea');
  reviewTextarea.id = 'review-text';
  reviewTextarea.className = 'review-form__textarea';
  reviewTextarea.placeholder = 'Share your experience with this product...';
  reviewTextarea.required = true;
  reviewTextarea.rows = 6;
  reviewTextarea.maxLength = 500;
  reviewSection.appendChild(reviewTextarea);

  // Character counter
  const charCounter = document.createElement('div');
  charCounter.className = 'review-form__char-counter';
  charCounter.textContent = '0 / 500 characters';
  reviewTextarea.addEventListener('input', () => {
    const length = reviewTextarea.value.length;
    charCounter.textContent = `${length} / 500 characters`;
  });
  reviewSection.appendChild(charCounter);

  form.appendChild(reviewSection);

  // Return form and getter for selected rating
  return {
    form,
    getSelectedRating: () => selectedRating,
    getNameInput: () => nameInput,
    getReviewTextarea: () => reviewTextarea,
  };
}

/**
 * Show review submission form in modal
 * @param {HTMLElement} modalContent - Modal content element
 * @param {number} averageRating - Average rating
 * @param {number} totalCount - Total count
 * @param {object} distribution - Distribution data
 * @param {Array} reviews - Reviews array
 */
function showReviewForm(modalContent, averageRating, totalCount, distribution, reviews) {
  // Save current content
  const originalContent = Array.from(modalContent.children).slice(1); // Skip header

  // Remove everything except header
  while (modalContent.children.length > 1) {
    modalContent.removeChild(modalContent.lastChild);
  }

  // Create form
  const { form, getSelectedRating, getNameInput, getReviewTextarea } = createReviewForm();

  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'review-form__buttons';

  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'review-form__button review-form__button--cancel';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    // Restore original content
    while (modalContent.children.length > 1) {
      modalContent.removeChild(modalContent.lastChild);
    }
    originalContent.forEach((child) => modalContent.appendChild(child));
  });
  buttonsContainer.appendChild(cancelButton);

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'review-form__button review-form__button--submit';
  submitButton.textContent = 'Submit Review';
  buttonsContainer.appendChild(submitButton);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const rating = getSelectedRating();
    const name = getNameInput().value.trim();
    const reviewText = getReviewTextarea().value.trim();

    // Validate
    if (rating === 0) {
      alert('Please select a star rating');
      return;
    }

    if (!name) {
      alert('Please enter your name');
      return;
    }

    if (!reviewText) {
      alert('Please write a review');
      return;
    }

    // Show success message
    showReviewSuccess(modalContent, rating, name, reviewText);
  });

  form.appendChild(buttonsContainer);
  modalContent.appendChild(form);

  // Focus first input
  setTimeout(() => {
    const firstStar = form.querySelector('.review-form__star');
    if (firstStar) {
      firstStar.focus();
    }
  }, 100);
}

/**
 * Show review submission success message
 * @param {HTMLElement} modalContent - Modal content element
 * @param {number} rating - Submitted rating
 * @param {string} name - Reviewer name
 * @param {string} reviewText - Review text
 */
function showReviewSuccess(modalContent, rating, name, reviewText) {
  // Clear content except header
  while (modalContent.children.length > 1) {
    modalContent.removeChild(modalContent.lastChild);
  }

  // Success message
  const successContainer = document.createElement('div');
  successContainer.className = 'review-form__success';

  const successIcon = document.createElement('div');
  successIcon.className = 'review-form__success-icon';
  successIcon.textContent = '✓';
  successContainer.appendChild(successIcon);

  const successTitle = document.createElement('h3');
  successTitle.className = 'review-form__success-title';
  successTitle.textContent = 'Thank You!';
  successContainer.appendChild(successTitle);

  const successMessage = document.createElement('p');
  successMessage.className = 'review-form__success-message';
  successMessage.textContent = 'Your review has been submitted and will appear shortly after moderation.';
  successContainer.appendChild(successMessage);

  // Show submitted review preview
  const reviewPreview = document.createElement('div');
  reviewPreview.className = 'review-form__preview';

  const previewStars = document.createElement('div');
  previewStars.className = 'review-form__preview-stars';
  for (let i = 0; i < 5; i += 1) {
    const star = document.createElement('span');
    star.textContent = i < rating ? '★' : '☆';
    star.className = i < rating ? 'product-rating__star--filled' : '';
    previewStars.appendChild(star);
  }
  reviewPreview.appendChild(previewStars);

  const previewName = document.createElement('div');
  previewName.className = 'review-form__preview-name';
  previewName.textContent = name;
  reviewPreview.appendChild(previewName);

  const previewText = document.createElement('div');
  previewText.className = 'review-form__preview-text';
  previewText.textContent = reviewText;
  reviewPreview.appendChild(previewText);

  successContainer.appendChild(reviewPreview);

  // Close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'review-form__button review-form__button--close';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', closeRatingDistributionModal);
  successContainer.appendChild(closeButton);

  modalContent.appendChild(successContainer);
}

/**
 * Open rating distribution modal with pagination and sorting support
 * @param {number} averageRating - Average rating (1-5)
 * @param {number} totalCount - Total number of ratings
 * @param {object} distribution - Distribution data
 * @param {Array} reviews - Array of review objects (optional)
 * @param {string} sku - Product SKU for loading more reviews
 * @param {object} paginationData - Pagination metadata
 * @param {string} sortBy - Sort field: 'date' or 'rating' (default: 'date')
 * @param {string} sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
 */
export function openRatingDistributionModal(averageRating, totalCount, distribution, reviews = [], sku = null, paginationData = null, sortBy = 'date', sortOrder = 'desc') {
  // Remove any existing modal
  const existingModal = document.querySelector('.rating-distribution-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'rating-distribution-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'rating-modal-title');

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'rating-distribution-modal__content';

  // Modal header
  const header = document.createElement('div');
  header.className = 'rating-distribution-modal__header';

  const title = document.createElement('h2');
  title.id = 'rating-modal-title';
  title.className = 'rating-distribution-modal__title';
  title.textContent = 'Customer Reviews';

  const closeButton = document.createElement('button');
  closeButton.className = 'rating-distribution-modal__close';
  closeButton.setAttribute('type', 'button');
  closeButton.setAttribute('aria-label', 'Close modal');
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', closeRatingDistributionModal);

  header.appendChild(title);
  header.appendChild(closeButton);

  // Rating summary
  const summary = document.createElement('div');
  summary.className = 'rating-distribution-modal__summary';

  const summaryRating = document.createElement('div');
  summaryRating.className = 'rating-distribution-modal__summary-rating';
  summaryRating.textContent = averageRating.toFixed(1);

  const summaryStars = document.createElement('div');
  summaryStars.className = 'rating-distribution-modal__summary-stars';
  
  // Add stars
  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    const star = document.createElement('span');
    star.className = 'product-rating__star product-rating__star--filled';
    star.textContent = '★';
    summaryStars.appendChild(star);
  }

  if (hasHalfStar) {
    const star = document.createElement('span');
    star.className = 'product-rating__star product-rating__star--half';
    star.textContent = '★';
    summaryStars.appendChild(star);
  }

  for (let i = 0; i < emptyStars; i++) {
    const star = document.createElement('span');
    star.className = 'product-rating__star product-rating__star--empty';
    star.textContent = '☆';
    summaryStars.appendChild(star);
  }

  const summaryCount = document.createElement('div');
  summaryCount.className = 'rating-distribution-modal__summary-count';
  summaryCount.textContent = `Based on ${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`;

  summary.appendChild(summaryRating);
  summary.appendChild(summaryStars);
  summary.appendChild(summaryCount);

  // Distribution chart
  const distributionElement = createRatingDistribution(distribution, totalCount);
  distributionElement.classList.add('rating-distribution-modal__chart');

  // Reviews section
  let reviewsElement = createReviewsList(reviews);
  reviewsElement.classList.add('rating-distribution-modal__reviews');

  // Write a Review button
  const writeReviewButton = document.createElement('button');
  writeReviewButton.className = 'rating-distribution-modal__write-review';
  writeReviewButton.setAttribute('type', 'button');
  writeReviewButton.textContent = 'Write a Review';
  writeReviewButton.addEventListener('click', () => {
    // Show review form
    showReviewForm(modalContent, averageRating, totalCount, distribution, reviews);
  });

  // Controls container (sorting + page size)
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'rating-distribution-modal__controls';

  // Sorting controls
  const sortingControls = document.createElement('div');
  sortingControls.className = 'rating-distribution-modal__sorting';

  const sortLabel = document.createElement('span');
  sortLabel.className = 'rating-distribution-modal__sorting-label';
  sortLabel.textContent = 'Sort by:';
  sortingControls.appendChild(sortLabel);

  // Sort by dropdown
  const sortBySelect = document.createElement('select');
  sortBySelect.className = 'rating-distribution-modal__sorting-select';
  sortBySelect.setAttribute('aria-label', 'Sort by field');
  
  const sortByDate = document.createElement('option');
  sortByDate.value = 'date';
  sortByDate.textContent = 'Date';
  sortByDate.selected = sortBy === 'date';
  sortBySelect.appendChild(sortByDate);

  const sortByRating = document.createElement('option');
  sortByRating.value = 'rating';
  sortByRating.textContent = 'Rating';
  sortByRating.selected = sortBy === 'rating';
  sortBySelect.appendChild(sortByRating);

  sortingControls.appendChild(sortBySelect);

  // Sort order dropdown
  const sortOrderSelect = document.createElement('select');
  sortOrderSelect.className = 'rating-distribution-modal__sorting-select';
  sortOrderSelect.setAttribute('aria-label', 'Sort order');
  
  const sortOrderDesc = document.createElement('option');
  sortOrderDesc.value = 'desc';
  sortOrderDesc.textContent = sortBy === 'date' ? 'Newest First' : 'Highest First';
  sortOrderDesc.selected = sortOrder === 'desc';
  sortOrderSelect.appendChild(sortOrderDesc);

  const sortOrderAsc = document.createElement('option');
  sortOrderAsc.value = 'asc';
  sortOrderAsc.textContent = sortBy === 'date' ? 'Oldest First' : 'Lowest First';
  sortOrderAsc.selected = sortOrder === 'asc';
  sortOrderSelect.appendChild(sortOrderAsc);

  sortingControls.appendChild(sortOrderSelect);

  // Handle sort changes
  const handleSortChange = async () => {
    const newSortBy = sortBySelect.value;
    const newSortOrder = sortOrderSelect.value;

    // Update sort order dropdown labels based on sort by selection
    sortOrderDesc.textContent = newSortBy === 'date' ? 'Newest First' : 'Highest First';
    sortOrderAsc.textContent = newSortBy === 'date' ? 'Oldest First' : 'Lowest First';

    if (sku) {
      // Show loading state
      const loadingIndicator = document.createElement('span');
      loadingIndicator.className = 'rating-distribution-modal__sorting-loading';
      loadingIndicator.textContent = 'Loading...';
      sortingControls.appendChild(loadingIndicator);

      // Disable controls while loading
      sortBySelect.disabled = true;
      sortOrderSelect.disabled = true;

      try {
        // Fetch reviews with new sorting
        const newData = await fetchProductRating(sku, 1, 5, newSortBy, newSortOrder);

        if (newData) {
          // Close current modal and open new one with updated data
          closeRatingDistributionModal();
          openRatingDistributionModal(
            newData.averageRating,
            newData.totalCount,
            newData.distribution,
            newData.reviews,
            sku,
            newData.pagination,
            newSortBy,
            newSortOrder
          );
        }
      } catch (error) {
        console.error('Error fetching sorted reviews:', error);
        // Re-enable controls on error
        sortBySelect.disabled = false;
        sortOrderSelect.disabled = false;
        if (loadingIndicator.parentNode) {
          loadingIndicator.remove();
        }
      }
    }
  };

  sortBySelect.addEventListener('change', handleSortChange);
  sortOrderSelect.addEventListener('change', handleSortChange);

  controlsContainer.appendChild(sortingControls);

  // Page size selector
  const pageSizeControls = document.createElement('div');
  pageSizeControls.className = 'rating-distribution-modal__page-size';

  const pageSizeLabel = document.createElement('span');
  pageSizeLabel.className = 'rating-distribution-modal__page-size-label';
  pageSizeLabel.textContent = 'Show:';
  pageSizeControls.appendChild(pageSizeLabel);

  const pageSizeSelect = document.createElement('select');
  pageSizeSelect.className = 'rating-distribution-modal__page-size-select';
  pageSizeSelect.setAttribute('aria-label', 'Reviews per page');

  // Page size options
  const pageSizes = [
    { value: '5', label: '5 reviews' },
    { value: '10', label: '10 reviews' },
    { value: '20', label: '20 reviews' },
    { value: '50', label: '50 reviews' },
    { value: '100', label: '100 reviews' },
    { value: 'all', label: 'All reviews' }
  ];

  pageSizes.forEach((size) => {
    const option = document.createElement('option');
    option.value = size.value;
    option.textContent = size.label;
    
    // Determine if this option should be selected
    let isSelected = false;
    if (paginationData) {
      if (size.value === 'all') {
        // "All reviews" is selected if limit equals totalReviews (no pagination)
        isSelected = paginationData.limit === paginationData.totalReviews;
      } else {
        // Regular page size
        isSelected = parseInt(size.value, 10) === paginationData.limit;
      }
    } else {
      // Default to 5 if no pagination data
      isSelected = size.value === '5';
    }
    
    option.selected = isSelected;
    pageSizeSelect.appendChild(option);
  });

  pageSizeControls.appendChild(pageSizeSelect);

  // Handle page size change
  const handlePageSizeChange = async () => {
    const newPageSize = pageSizeSelect.value;
    
    if (sku) {
      // Show loading state
      const loadingIndicator = document.createElement('span');
      loadingIndicator.className = 'rating-distribution-modal__sorting-loading';
      loadingIndicator.textContent = 'Loading...';
      controlsContainer.appendChild(loadingIndicator);

      // Disable controls while loading
      sortBySelect.disabled = true;
      sortOrderSelect.disabled = true;
      pageSizeSelect.disabled = true;

      try {
        // Use the value directly - API accepts numbers as strings or "all"
        const limit = newPageSize === 'all' ? 'all' : parseInt(newPageSize, 10);
        const newData = await fetchProductRating(sku, 1, limit, sortBySelect.value, sortOrderSelect.value);

        if (newData) {
          // Close current modal and open new one with updated data
          closeRatingDistributionModal();
          openRatingDistributionModal(
            newData.averageRating,
            newData.totalCount,
            newData.distribution,
            newData.reviews,
            sku,
            newData.pagination,
            sortBySelect.value,
            sortOrderSelect.value
          );
        }
      } catch (error) {
        console.error('Error fetching reviews with new page size:', error);
        // Re-enable controls on error
        sortBySelect.disabled = false;
        sortOrderSelect.disabled = false;
        pageSizeSelect.disabled = false;
        if (loadingIndicator.parentNode) {
          loadingIndicator.remove();
        }
      }
    }
  };

  pageSizeSelect.addEventListener('change', handlePageSizeChange);

  controlsContainer.appendChild(pageSizeControls);

  // Load More button (if applicable)
  // Hide Load More button when "All reviews" is selected or if no more pages
  let loadMoreButton = null;
  const currentLimit = paginationData ? paginationData.limit : 5;
  // Show Load More only if there are more pages AND we're not showing all reviews
  const showLoadMore = sku && paginationData && paginationData.hasNextPage && currentLimit !== paginationData.totalReviews;
  
  if (showLoadMore) {
    loadMoreButton = document.createElement('button');
    loadMoreButton.className = 'rating-distribution-modal__load-more';
    loadMoreButton.setAttribute('type', 'button');
    loadMoreButton.textContent = `Load More Reviews (${paginationData.page}/${paginationData.totalPages})`;
    
    loadMoreButton.addEventListener('click', async () => {
      // Disable button while loading
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = 'Loading...';
      
      try {
        // Fetch next page of reviews with current sorting and page size
        const nextPage = paginationData.page + 1;
        const moreData = await fetchProductRating(sku, nextPage, currentLimit, sortBy, sortOrder);
        
        if (moreData && moreData.reviews) {
          // Append new reviews to the existing list
          const newReviews = [...reviews, ...moreData.reviews];
          
          // Update the reviews element
          const newReviewsElement = createReviewsList(newReviews);
          newReviewsElement.classList.add('rating-distribution-modal__reviews');
          reviewsElement.replaceWith(newReviewsElement);
          
          // Update the reference to point to the new element in the DOM
          reviewsElement = newReviewsElement;
          
          // Update pagination data
          paginationData.page = moreData.pagination.page;
          paginationData.hasNextPage = moreData.pagination.hasNextPage;
          
          // Update or remove load more button
          if (moreData.pagination.hasNextPage) {
            loadMoreButton.disabled = false;
            loadMoreButton.textContent = `Load More Reviews (${moreData.pagination.page}/${moreData.pagination.totalPages})`;
          } else {
            loadMoreButton.remove();
          }
          
          // Store the updated reviews for future use
          reviews.push(...moreData.reviews);
        } else {
          loadMoreButton.disabled = false;
          loadMoreButton.textContent = 'Load More Reviews';
        }
      } catch (error) {
        console.error('Error loading more reviews:', error);
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = 'Load More Reviews (Error - Try Again)';
      }
    });
  }

  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(summary);
  modalContent.appendChild(writeReviewButton);
  modalContent.appendChild(controlsContainer);
  modalContent.appendChild(distributionElement);
  modalContent.appendChild(reviewsElement);
  if (loadMoreButton) {
    modalContent.appendChild(loadMoreButton);
  }

  modal.appendChild(modalContent);

  // Add to document
  document.body.appendChild(modal);

  // Focus close button for accessibility
  closeButton.focus();

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeRatingDistributionModal();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeRatingDistributionModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Close rating distribution modal
 */
export function closeRatingDistributionModal() {
  const modal = document.querySelector('.rating-distribution-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

/**
 * Clear ratings cache
 * Useful when you want to force refresh ratings data
 */
export function clearRatingsCache() {
  try {
    const keysToRemove = [];
    
    // Find all rating cache entries
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all rating cache entries
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing ratings cache:', error);
  }
}

