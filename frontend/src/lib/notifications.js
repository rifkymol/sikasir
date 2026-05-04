import Swal from 'sweetalert2'

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
})

export function showSuccess(title, text) {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        timer: 1800,
        showConfirmButton: false,
    })
}

export function showError(title, text) {
    return Swal.fire({
        icon: 'error',
        title,
        text,
    })
}

export function showWarning(title, text) {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
    })
}

export function showLoading(title = 'Memproses...') {
    Swal.fire({
        title,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })
}

export function closeAlert() {
    Swal.close()
}

export async function confirmAction({
    title,
    text,
    confirmButtonText = 'Lanjut',
    cancelButtonText = 'Batal',
    confirmButtonColor = '#d33',
    cancelButtonColor = '#6b7280',
}) {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        confirmButtonColor,
        cancelButtonColor,
    })

    return result.isConfirmed
}