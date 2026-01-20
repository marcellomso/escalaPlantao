import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GestorSelector from './GestorSelector';

const mockGestores = [
  { id: '1', name: 'Gestor 1' },
  { id: '2', name: 'Gestor 2' },
  { id: '3', name: 'Gestor 3' },
];

describe('GestorSelector', () => {
  it('deve renderizar select com opção padrão', () => {
    render(<GestorSelector value="" onChange={() => {}} gestores={mockGestores} />);
    
    expect(screen.getByText('Selecione um gestor...')).toBeInTheDocument();
  });

  it('deve mostrar todos os gestores como opções', () => {
    render(<GestorSelector value="" onChange={() => {}} gestores={mockGestores} />);
    
    expect(screen.getByText('Gestor 1')).toBeInTheDocument();
    expect(screen.getByText('Gestor 2')).toBeInTheDocument();
    expect(screen.getByText('Gestor 3')).toBeInTheDocument();
  });

  it('deve chamar onChange ao selecionar gestor', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<GestorSelector value="" onChange={handleChange} gestores={mockGestores} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '2');
    
    expect(handleChange).toHaveBeenCalledWith('2');
  });

  it('deve mostrar badge vinculado quando showLinkedBadge e linkedGestorName', () => {
    render(
      <GestorSelector 
        value="1" 
        onChange={() => {}} 
        gestores={mockGestores}
        showLinkedBadge={true}
        linkedGestorName="Gestor 1"
      />
    );
    
    // Não deve ter select
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    
    // Deve mostrar badge de vinculado
    expect(screen.getByText('Vinculado: Gestor 1')).toBeInTheDocument();
  });

  it('deve desabilitar select quando disabled é true', () => {
    render(
      <GestorSelector 
        value="" 
        onChange={() => {}} 
        gestores={mockGestores}
        disabled={true}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('deve aplicar estilo de pendente quando não tem valor', () => {
    render(<GestorSelector value="" onChange={() => {}} gestores={mockGestores} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-amber-300');
  });

  it('deve chamar onChange com null ao selecionar opção vazia', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<GestorSelector value="1" onChange={handleChange} gestores={mockGestores} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '');
    
    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
