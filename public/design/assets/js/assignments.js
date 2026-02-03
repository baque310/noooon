/* Assignments Logic */

function openAddAssignmentModal() {
    document.getElementById('addAssignmentModal').style.display = 'flex';
}

function closeAddAssignmentModal() {
    document.getElementById('addAssignmentModal').style.display = 'none';
}

function openAssignmentDetail(assignmentData) {
    const modal = document.getElementById('assignmentDetailModal');
    
    // Fill modal with data (In a real app, this would come from the clicked element)
    document.getElementById('detail-title').innerText = assignmentData.title || 'كتابة سورة العلق';
    document.getElementById('detail-desc').innerText = assignmentData.desc || 'كتابة السورة مرتين في دفتر الواجبات مع حفظ المعاني والشرح الميسر للآيات الكريمة.';
    document.getElementById('detail-subject').innerText = assignmentData.subject || 'اللغة العربية';
    document.getElementById('detail-teacher').innerText = assignmentData.teacher || 'أ. أحمد علي';
    document.getElementById('detail-class').innerText = assignmentData.class || 'الأول الابتدائي - شعبة A';
    document.getElementById('detail-date-post').innerText = assignmentData.datePost || '2026/05/20';
    document.getElementById('detail-date-due').innerText = assignmentData.dateDue || '2026/05/22';
    
    modal.style.display = 'flex';
}

function closeAssignmentDetailModal() {
    document.getElementById('assignmentDetailModal').style.display = 'none';
}

function toggleStudentSelector(show) {
    document.getElementById('student-selector-box').style.display = show ? 'block' : 'none';
}

function saveAssignment() {
    alert('تم حفظ ونشر الواجب بنجاح لجميع الطلبة المحددين!');
    closeAddAssignmentModal();
}

// Side-bar active state helper (if needed for standalone page)
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // any initialization
});
