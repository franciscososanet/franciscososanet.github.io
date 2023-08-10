function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.plan:nth-child(1) button').addEventListener('click', () => openModal('modalBasic'));
    document.querySelector('.plan:nth-child(2) button').addEventListener('click', () => openModal('modalPremium'));
    document.querySelector('.plan:nth-child(3) button').addEventListener('click', () => openModal('modalBusiness'));
});
