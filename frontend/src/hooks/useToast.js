import Swal from 'sweetalert2';

export function useToast() {
  const toast = (icon, title) =>
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      icon,
      title,
    });

  const confirm = (title, text) =>
    Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel',
    });

  return { toast, confirm };
}
