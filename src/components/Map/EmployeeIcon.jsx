function EmployeeIcon({ color = "#ff0000", size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Голова */}
      <circle cx="32" cy="16" r="10" fill={color} />
      {/* Тело */}
      <path
        d="M22 56c0-8 20-8 20 0v-16H22v16z"
        fill={color}
      />
      {/* Руки */}
      <path
        d="M12 32h40v8H12v-8z"
        fill={color}
      />
    </svg>
  );
}

export default EmployeeIcon;
