import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamAlert from './TeamAlert';

describe('TeamAlert', () => {
  it('deve renderizar título e descrição', () => {
    render(
      <TeamAlert 
        title="Alerta de teste" 
        description="Descrição do alerta"
      />
    );
    
    expect(screen.getByText('Alerta de teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do alerta')).toBeInTheDocument();
  });

  it('deve exibir contador quando count é fornecido', () => {
    render(
      <TeamAlert 
        count={5}
        title="usuários pendentes"
      />
    );
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('usuários pendentes')).toBeInTheDocument();
  });

  it('deve renderizar botão de ação quando actionLabel e onAction são fornecidos', () => {
    const handleAction = vi.fn();
    
    render(
      <TeamAlert 
        title="Teste"
        actionLabel="Ver Detalhes"
        onAction={handleAction}
      />
    );
    
    expect(screen.getByText('Ver Detalhes')).toBeInTheDocument();
  });

  it('deve chamar onAction ao clicar no botão', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TeamAlert 
        title="Teste"
        actionLabel="Ver Detalhes"
        onAction={handleAction}
      />
    );
    
    const button = screen.getByText('Ver Detalhes');
    await user.click(button);
    
    expect(handleAction).toHaveBeenCalled();
  });

  it('deve aplicar estilos corretos para type pendingRoles', () => {
    const { container } = render(
      <TeamAlert 
        type="pendingRoles"
        title="Pendentes"
      />
    );
    
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-amber-50');
    expect(alert).toHaveClass('border-amber-200');
  });

  it('deve aplicar estilos corretos para type unlinkedCorretores', () => {
    const { container } = render(
      <TeamAlert 
        type="unlinkedCorretores"
        title="Sem vínculo"
      />
    );
    
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-red-50');
    expect(alert).toHaveClass('border-red-200');
  });

  it('deve aplicar estilos corretos para type noGestores', () => {
    const { container } = render(
      <TeamAlert 
        type="noGestores"
        title="Sem gestores"
      />
    );
    
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-blue-50');
    expect(alert).toHaveClass('border-blue-200');
  });

  it('não deve renderizar botão quando actionLabel ou onAction não são fornecidos', () => {
    render(
      <TeamAlert 
        title="Teste"
        actionLabel="Ver Detalhes"
        // sem onAction
      />
    );
    
    // O botão não deve estar presente como elemento clicável
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
});
