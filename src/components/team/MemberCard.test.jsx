import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemberCard from './MemberCard';

const mockMember = {
  id: '1',
  name: 'João Silva',
  email: 'joao@teste.com',
  role: 'corretor',
};

describe('MemberCard', () => {
  it('deve renderizar nome e email do membro', () => {
    render(<MemberCard member={mockMember} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@teste.com')).toBeInTheDocument();
  });

  it('deve exibir inicial do nome no avatar', () => {
    render(<MemberCard member={mockMember} />);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('deve mostrar badge "Você" quando isCurrentUser é true', () => {
    render(<MemberCard member={mockMember} isCurrentUser={true} />);
    
    expect(screen.getByText('Você')).toBeInTheDocument();
  });

  it('deve mostrar badge de cargo quando showRoleBadge é true', () => {
    render(<MemberCard member={mockMember} showRoleBadge={true} />);
    
    expect(screen.getByText('Corretor')).toBeInTheDocument();
  });

  it('deve ocultar badge de cargo quando showRoleBadge é false', () => {
    render(<MemberCard member={mockMember} showRoleBadge={false} />);
    
    expect(screen.queryByText('Corretor')).not.toBeInTheDocument();
  });

  it('deve mostrar informações do gestor vinculado', () => {
    render(
      <MemberCard 
        member={mockMember} 
        showGestorInfo={true} 
        gestorName="Maria Gestora" 
      />
    );
    
    expect(screen.getByText('Vinculado: Maria Gestora')).toBeInTheDocument();
  });

  it('deve chamar onEdit quando clicar no botão editar', async () => {
    const handleEdit = vi.fn();
    const user = userEvent.setup();
    
    render(
      <MemberCard 
        member={mockMember} 
        actions={['edit']} 
        onEdit={handleEdit} 
      />
    );
    
    const editButton = screen.getByTitle('Editar');
    await user.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledWith(mockMember);
  });

  it('deve chamar onDelete quando clicar no botão excluir', async () => {
    const handleDelete = vi.fn();
    const user = userEvent.setup();
    
    render(
      <MemberCard 
        member={mockMember} 
        actions={['delete']} 
        onDelete={handleDelete} 
      />
    );
    
    const deleteButton = screen.getByTitle('Excluir');
    await user.click(deleteButton);
    
    expect(handleDelete).toHaveBeenCalledWith(mockMember);
  });

  it('deve aplicar estilo correto para variant gestor', () => {
    const { container } = render(
      <MemberCard member={{ ...mockMember, role: 'gestor' }} variant="gestor" />
    );
    
    const card = container.querySelector('.card');
    expect(card).toHaveClass('from-amber-50');
  });

  it('deve aplicar estilo correto para variant pending', () => {
    const { container } = render(
      <MemberCard member={{ ...mockMember, role: 'pendente' }} variant="pending" />
    );
    
    const card = container.querySelector('.card');
    expect(card).toHaveClass('border-amber-300');
  });

  it('deve renderizar children corretamente', () => {
    render(
      <MemberCard member={mockMember}>
        <div data-testid="child-content">Conteúdo Extra</div>
      </MemberCard>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Extra')).toBeInTheDocument();
  });
});
