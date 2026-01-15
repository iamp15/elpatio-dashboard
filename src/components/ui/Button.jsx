import './Button.css'

function Button({ children, onClick, variant = 'primary', size, disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
