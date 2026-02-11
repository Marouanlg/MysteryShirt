/**
 * Customize Selection Popup
 *
 * Handles the modal popup for choosing nations/leagues to avoid,
 * specific teams to avoid, and additional criteria.
 * Syncs selections to hidden form inputs for cart line item properties.
 */
const MAX_NATIONS = 3;
class CustomizeSelectionPopup extends HTMLElement {
  connectedCallback() {
    this.overlay = /** @type {HTMLElement|null} */ (this.querySelector('[ref="overlay"]'));
    this.modal = /** @type {HTMLElement|null} */ (this.querySelector('[ref="modal"]'));
    this.triggerButton = /** @type {HTMLElement|null} */ (this.querySelector('[ref="triggerButton"]'));
    this.hiddenNations = /** @type {HTMLInputElement|null} */ (this.querySelector('[ref="hiddenNations"]'));
    this.hiddenTeams = /** @type {HTMLInputElement|null} */ (this.querySelector('[ref="hiddenTeams"]'));
    this.hiddenCriteria = /** @type {HTMLInputElement|null} */ (this.querySelector('[ref="hiddenCriteria"]'));
    this.teamsTextarea = /** @type {HTMLTextAreaElement|null} */ (this.querySelector('[ref="teamsTextarea"]'));
    this.criteriaTextarea = /** @type {HTMLTextAreaElement|null} */ (this.querySelector('[ref="criteriaTextarea"]'));
    this.nationsGrid = /** @type {HTMLElement|null} */ (this.querySelector('[ref="nationsGrid"]'));
    /** @type {HTMLInputElement[]} */
    this.checkboxes = this.nationsGrid
      ? /** @type {HTMLInputElement[]} */ (Array.from(this.nationsGrid.querySelectorAll('.customize-selection__nation-checkbox')))
      : [];
    // Bind methods
    this._onKeyDown = this._onKeyDown.bind(this);
    // Set up event listeners
    this._setupListeners();
  }
  _setupListeners() {
    // Trigger button
    if (this.triggerButton) {
      this.triggerButton.addEventListener('click', () => this.openModal());
    }
    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeModal());
    }
    // Close button
    const closeButton = this.querySelector('[ref="closeButton"]');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeModal());
    }
    // Cancel button
    const cancelBtn = this.querySelector('.customize-selection__cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }
    // Proceed button
    const proceedBtn = this.querySelector('.customize-selection__proceed');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => this.handleProceed());
    }
    // Nation checkboxes
    if (this.checkboxes) {
      this.checkboxes.forEach((cb) => {
        cb.addEventListener('change', () => this._enforceMaxNations());
      });
    }
  }
  openModal() {
    if (!this.overlay || !this.modal) return;
    this.overlay.style.display = '';
    this.modal.style.display = '';
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    // Listen for Escape key
    document.addEventListener('keydown', this._onKeyDown);
    // Focus the first interactive element in the modal
    requestAnimationFrame(() => {
      if (!this.modal) return;
      const closeBtn = /** @type {HTMLElement|null} */ (this.modal.querySelector('.customize-selection__close'));
      if (closeBtn) closeBtn.focus();
    });
  }
  closeModal() {
    if (!this.overlay || !this.modal) return;
    this.overlay.style.display = 'none';
    this.modal.style.display = 'none';
    // Restore body scroll
    document.body.style.overflow = '';
    // Remove key listener
    document.removeEventListener('keydown', this._onKeyDown);
    // Return focus to trigger
    if (this.triggerButton) {
      this.triggerButton.focus();
    }
  }
  handleProceed() {
    // Gather selected nations
    const selectedNations = (this.checkboxes || [])
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    const teamsValue = this.teamsTextarea ? this.teamsTextarea.value.trim() : '';
    const criteriaValue = this.criteriaTextarea ? this.criteriaTextarea.value.trim() : '';
    // Sync to hidden inputs
    if (this.hiddenNations) {
      this.hiddenNations.value = selectedNations.join(', ');
    }
    if (this.hiddenTeams) {
      this.hiddenTeams.value = teamsValue;
    }
    if (this.hiddenCriteria) {
      this.hiddenCriteria.value = criteriaValue;
    }
    // Close the modal
    this.closeModal();
    // Update button text to show selections were made
    if (this.triggerButton && (selectedNations.length > 0 || teamsValue || criteriaValue)) {
      const span = this.triggerButton.querySelector('.customize-selection__icon');
      const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      if (span) span.innerHTML = checkSvg;
      // Update text node
      const textNodes = Array.from(this.triggerButton.childNodes).filter(
        (n) => n.nodeType === Node.TEXT_NODE
      );
      const lastTextNode = textNodes[textNodes.length - 1];
      if (lastTextNode) {
        lastTextNode.textContent = ' Selection Saved ✓';
      }
      this.triggerButton.classList.add('customize-selection__trigger--saved');
    }
  }
  _enforceMaxNations() {
    if (!this.checkboxes) return;
    const checkedCount = this.checkboxes.filter((cb) => cb.checked).length;
    this.checkboxes.forEach((cb) => {
      if (!cb.checked) {
        cb.disabled = checkedCount >= MAX_NATIONS;
      }
    });
  }
  _onKeyDown(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape') {
      this.closeModal();
    }
  }
}
if (!customElements.get('customize-selection-popup')) {
  customElements.define('customize-selection-popup', CustomizeSelectionPopup);
}