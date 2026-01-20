import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabNavigation from './TabNavigation';
import { Users, Settings, Link2 } from 'lucide-react';

const mockTabs = [
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'cargos', label: 'Cargos', icon: Settings, badge: 2 },
  { id: 'vinculos', label: 'Vínculos', icon: Link2, badge: 0 },
];

describe('TabNavigation', () => {
  it('deve renderizar todas as tabs', () => {
    render(
      <TabNavigation 
        tabs={mockTabs} 
        activeTab="equipe" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByText('Equipe')).toBeInTheDocument();
    expect(screen.getByText('Cargos')).toBeInTheDocument();
    expect(screen.getByText('Vínculos')).toBeInTheDocument();
  });

  it('deve destacar a tab ativa', () => {
    render(
      <TabNavigation 
        tabs={mockTabs} 
        activeTab="equipe" 
        onChange={() => {}} 
      />
    );
    
    const activeButton = screen.getByText('Equipe').closest('button');
    expect(activeButton).toHaveClass('bg-white');
    expect(activeButton).toHaveClass('text-primary-700');
  });

  it('deve mostrar badge apenas quando maior que zero', () => {
    render(
      <TabNavigation 
        tabs={mockTabs} 
        activeTab="equipe" 
        onChange={() => {}} 
      />
    );
    
    // Badge de 2 deve aparecer
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Badge de 0 não deve aparecer
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('deve chamar onChange com o id da tab ao clicar', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TabNavigation 
        tabs={mockTabs} 
        activeTab="equipe" 
        onChange={handleChange} 
      />
    );
    
    const cargosTab = screen.getByText('Cargos').closest('button');
    await user.click(cargosTab);
    
    expect(handleChange).toHaveBeenCalledWith('cargos');
  });

  it('deve renderizar ícones das tabs', () => {
    const { container } = render(
      <TabNavigation 
        tabs={mockTabs} 
        activeTab="equipe" 
        onChange={() => {}} 
      />
    );
    
    // Verifica se há SVGs (ícones do Lucide)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });

  it('deve funcionar sem ícones', () => {
    const tabsSemIcones = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
    ];
    
    render(
      <TabNavigation 
        tabs={tabsSemIcones} 
        activeTab="tab1" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });
});
