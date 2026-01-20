import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleDropdown from './RoleDropdown';

describe('RoleDropdown', () => {
  it('deve renderizar select com valor atual', () => {
    render(<RoleDropdown value="corretor" onChange={() => {}} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('corretor');
  });

  it('deve mostrar todas as opções de cargo', () => {
    render(<RoleDropdown value="corretor" onChange={() => {}} />);
    
    expect(screen.getByText(/Corretor/)).toBeInTheDocument();
    expect(screen.getByText(/Gestor/)).toBeInTheDocument();
    expect(screen.getByText(/Recepcionista/)).toBeInTheDocument();
    expect(screen.getByText(/Diretor/)).toBeInTheDocument();
  });

  it('deve chamar onChange ao selecionar novo cargo', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<RoleDropdown value="corretor" onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'gestor');
    
    expect(handleChange).toHaveBeenCalledWith('gestor');
  });

  it('deve mostrar badge fixo quando isCurrentUser é true', () => {
    render(<RoleDropdown value="diretor" onChange={() => {}} isCurrentUser={true} />);
    
    // Não deve ter select
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    
    // Deve mostrar badge com cargo e "(Seu cargo)"
    expect(screen.getByText(/Diretor/)).toBeInTheDocument();
    expect(screen.getByText('(Seu cargo)')).toBeInTheDocument();
  });

  it('deve mostrar opção pendente quando showPendingOption é true e value é pendente', () => {
    render(
      <RoleDropdown 
        value="pendente" 
        onChange={() => {}} 
        showPendingOption={true} 
      />
    );
    
    expect(screen.getByText(/Pendente - Selecione um cargo/)).toBeInTheDocument();
  });

  it('deve desabilitar select quando disabled é true', () => {
    render(<RoleDropdown value="corretor" onChange={() => {}} disabled={true} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('deve aplicar estilo de pendente quando value é pendente', () => {
    render(<RoleDropdown value="pendente" onChange={() => {}} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-amber-300');
  });
});
