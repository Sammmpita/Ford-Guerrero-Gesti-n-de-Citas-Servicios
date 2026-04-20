document.getElementById('calendarPicker').addEventListener('change', function() {
    window.location.href = '?fecha=' + this.value;
});
