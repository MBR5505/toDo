document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (navLinks && navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  });

  // Delete confirmation
  const deleteForms = document.querySelectorAll('.delete-form');
  if (deleteForms) {
    deleteForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        if (!confirm('Are you sure you want to delete this todo?')) {
          e.preventDefault();
        }
      });
    });
  }

  // Week selector form
  const weekSelectForm = document.getElementById('weekSelectForm');
  if (weekSelectForm) {
    weekSelectForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const year = document.getElementById('year').value;
      const week = document.getElementById('week').value;
      window.location.href = `/todos/week/${year}/${week}`;
    });
  }

  // Set default date for date inputs
  const dateInputs = document.querySelectorAll('input[type="date"]');
  if (dateInputs.length > 0) {
    dateInputs.forEach(input => {
      if (!input.value) {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        input.value = dateString;
      }
    });
  }
  
  // Todo item hover effect
  const todoItems = document.querySelectorAll('.todo-item');
  if (todoItems) {
    todoItems.forEach(item => {
      // Show actions on hover
      item.addEventListener('mouseenter', function() {
        this.querySelector('.todo-actions').classList.add('visible');
      });
      
      item.addEventListener('mouseleave', function() {
        this.querySelector('.todo-actions').classList.remove('visible');
      });
      
      // Add click to view/edit
      item.addEventListener('click', function(e) {
        // Prevent click when clicking action buttons
        if (!e.target.closest('.todo-actions')) {
          const editUrl = this.querySelector('.edit-btn').getAttribute('href');
          window.location.href = editUrl;
        }
      });
    });
  }
  
  // Enhanced hover effects for time slots with multiple todos
  const todoCountWrappers = document.querySelectorAll('.todo-count-wrapper');
  if (todoCountWrappers.length > 0) {
    todoCountWrappers.forEach(wrapper => {
      // Handle clicks on specific todo items
      wrapper.querySelectorAll('.todo-item').forEach(item => {
        item.addEventListener('click', function(e) {
          // Only redirect if not clicking on action buttons
          if (!e.target.closest('.todo-actions')) {
            const editUrl = this.querySelector('.edit-btn').getAttribute('href');
            window.location.href = editUrl;
          }
        });
      });
    });
  }
  
  // Today highlight in calendar
  highlightToday();
});

// Function to highlight today's column in the calendar
function highlightToday() {
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[today.getDay()];
  
  // Get current week and year displayed on the page
  const currentWeekElement = document.querySelector('.current-week');
  if (!currentWeekElement) return;
  
  // Extract week and year from the displayed text (format: "Week XX, YYYY")
  const weekYearText = currentWeekElement.textContent;
  const matches = weekYearText.match(/Week (\d+), (\d+)/);
  
  if (!matches) return;
  
  const displayedWeek = parseInt(matches[1]);
  const displayedYear = parseInt(matches[2]);
  
  // Calculate current week and year
  const currentYear = today.getFullYear();
  // Use the same getWeekNumber function as the server
  // This is a simplified version for client-side
  const currentDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  currentDate.setUTCDate(currentDate.getUTCDate() + 4 - (currentDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 1));
  const currentWeek = Math.ceil((((currentDate - yearStart) / 86400000) + 1) / 7);
  
  // Only highlight today if we're viewing the current week
  if (currentWeek === displayedWeek && currentYear === displayedYear) {
    // Get all day columns
    const dayHeaders = document.querySelectorAll('.day-header');
    
    // Loop through headers to find today
    for (let i = 0; i < dayHeaders.length; i++) {
      if (dayHeaders[i].textContent.trim() === todayName) {
        dayHeaders[i].classList.add('today');
        // Also highlight time slots for today
        const hourRows = document.querySelectorAll('.hour-row');
        hourRows.forEach(row => {
          const todaySlot = row.querySelectorAll('.time-slot')[i];
          if (todaySlot) {
            todaySlot.classList.add('today-slot');
          }
        });
        break;
      }
    }
  }
}
