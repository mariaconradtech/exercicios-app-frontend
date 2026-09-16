export function formatCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').padStart(11, '0').slice(0, 11);
  const chars = ['•', '•', '•', '•', '•', '•', '•', '•', '•', digitos[9], digitos[10]];

  return `${chars.slice(0, 3).join('')}.${chars.slice(3, 6).join('')}.${chars
    .slice(6, 9)
    .join('')}-${chars.slice(9, 11).join('')}`;
}
