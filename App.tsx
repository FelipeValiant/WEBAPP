import React, { useState, useEffect, useRef } from 'react';
import { Event, Item, Photo, EventStatus, ItemStatus } from './types';
import { sendToDatabase } from './services/api'; 
// AI Service import removed for now as requested
// import { analyzeImage } from './services/geminiService';

// --- Assets / Mock Data Helpers ---
const MOCK_EVENT_IMG = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop";
const CAIXA_EVENT_IMG = "https://i.imgur.com/Kz8qf6x.png"; 

// --- Helper: Category Icons (Simplified Names) ---
const getCategoryIcon = (categoryName: string): string => {
    const map: Record<string, string> = {
        'Cenografia': 'theater_comedy',
        'Mobiliário': 'chair',
        'Iluminação e Sonorização': 'speaker_group',
        'Ornamentação': 'potted_plant',
        'Equipamentos': 'router',
        'Comunicação Visual': 'signpost',
        'Comunicação Audiovisual': 'video_camera_back',
        'Comunicação Digital': 'devices',
        'Comunicação Gráfica': 'print',
        'Material Promocional': 'redeem', // Renamed from Promocional
        'Comunicação Têxtil': 'apparel',
        'Foto e Filmagem': 'photo_camera',
        'Recursos Humanos': 'groups',
        'Serviços Artísticos': 'artist',
        'Serviços Essenciais': 'lightbulb',
        'Serviços Técnicos': 'construction',
        'Transporte e Logística': 'local_shipping',
        'Taxas e Alvarás': 'description',
        'A&B': 'restaurant',
        'Outros': 'more_horiz'
    };
    return map[categoryName] || 'category';
};

// --- Data: CAIXA Event Items (Full PDF Import) ---
const FULL_IMPORTED_ITEMS: Item[] = [
    // Cenografia (Page 1)
    { id: 'cen-01', category: 'Cenografia', name: 'Credenciamento imprensa/chapelaria', description: 'Painel de fundo em madeira com lona, balcões de atendimento, cadeiras, piso adesivado, elétrica e iluminação funcional', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'badge', photos: [], checklist: [] },
    { id: 'cen-02', category: 'Cenografia', name: 'Cenografia foyer', description: 'Painéis estruturados, pórticos com molduras arredondadas, neon flex, adesivos de piso e logos CAIXA volumétricos', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'wallpaper', photos: [], checklist: [] },
    { id: 'cen-03', category: 'Cenografia', name: 'Cenografia lojinha', description: 'Balcão orgânico em marcenaria, prateleiras expositivas, arara e piso adesivado', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'storefront', photos: [], checklist: [] },
    { id: 'cen-04', category: 'Cenografia', name: 'Palco imprensa', description: 'Painel de fundo, praticável em madeira com carpete e púlpito adesivado', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'podium', photos: [], checklist: [] },
    { id: 'cen-05', category: 'Cenografia', name: 'Espaço coffee break', description: 'Painel cenográfico com lona, neon flex e piso adesivado', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'coffee', photos: [], checklist: [] },
    { id: 'cen-06', category: 'Cenografia', name: 'Totens de sinalização cenográfica', description: '9 unidades dupla face com programação visual', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'signpost', photos: [], checklist: [] },
    { id: 'cen-07', category: 'Cenografia', name: 'Photo Opp foyer', description: '2 bancos circulares, painel de fundo e estruturas acrílicas cenográficas', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'camera_front', photos: [], checklist: [] },
    { id: 'cen-08', category: 'Cenografia', name: 'Bancos cenográficos', description: 'Em marcenaria adesivada', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'chair', photos: [], checklist: [] },
    { id: 'cen-09', category: 'Cenografia', name: 'Túnel LED', description: 'Piso adesivado, paredes reflexivas e teto estruturado', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'light_mode', photos: [], checklist: [] },
    { id: 'cen-10', category: 'Cenografia', name: 'Túnel com fitas LED', description: 'Material reflexivo, paredes e teto com neon flex', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'light_mode', photos: [], checklist: [] },
    { id: 'cen-11', category: 'Cenografia', name: 'Pórticos internos dos túneis', description: 'Estruturas em madeira com acabamento em napa azul', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'door_front', photos: [], checklist: [] },
    { id: 'cen-12', category: 'Cenografia', name: 'Plenária', description: 'Palco curvo com carpete azul, fitas de LED, rampa e fundo de palco', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'theater_comedy', photos: [], checklist: [] },
    { id: 'cen-13', category: 'Cenografia', name: 'Sala podcast', description: 'Estrutura com isolamento acústico, vidro, mobiliário, elétrica, iluminação e piso adesivado', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'mic', photos: [], checklist: [] },
    { id: 'cen-14', category: 'Cenografia', name: 'Praticáveis de imprensa', description: 'Com guarda-corpo e escadas laterais', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'stairs', photos: [], checklist: [] },
    { id: 'cen-15', category: 'Cenografia', name: 'Puffs cenográficos', description: 'Em marcenaria, revestidos em napa preta com LED', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'chair', photos: [], checklist: [] },
    { id: 'cen-16', category: 'Cenografia', name: 'Área de descompressão 1', description: 'Pórticos temáticos, elementos aéreos e letras caixa iluminadas', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'spa', photos: [], checklist: [] },
    { id: 'cen-17', category: 'Cenografia', name: 'Adesivo de piso cenográfico 1', description: 'Área de descompressão 1', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'layers', photos: [], checklist: [] },
    { id: 'cen-18', category: 'Cenografia', name: 'Área de descompressão 2', description: 'Estruturas orgânicas e elementos aéreos iluminados', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'spa', photos: [], checklist: [] },
    { id: 'cen-19', category: 'Cenografia', name: 'Adesivo de piso cenográfico 2', description: 'Área de descompressão 2', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'layers', photos: [], checklist: [] },
    { id: 'cen-20', category: 'Cenografia', name: 'Coquetel bar cartões', description: 'Estrutura cenográfica completa com balcão e fechamentos', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'local_bar', photos: [], checklist: [] },
    { id: 'cen-21', category: 'Cenografia', name: 'Coquetel bar seguridade', description: 'Estrutura cenográfica completa com balcão e fechamentos', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'local_bar', photos: [], checklist: [] },
    { id: 'cen-22', category: 'Cenografia', name: 'Cenografia Plinko', description: 'Painel estruturado em madeira com neon flex e suporte para LED', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'casino', photos: [], checklist: [] },
    // Cenografia (Page 2)
    { id: 'cen-23', category: 'Cenografia', name: 'Complemento de balcão', description: 'Ampliação de neon flex', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'add', photos: [], checklist: [] },
    { id: 'cen-24', category: 'Cenografia', name: 'Cafeteria asset', description: 'Balcões, painel curvo, sanca com LED e instalações elétricas', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'coffee_maker', photos: [], checklist: [] },
    { id: 'cen-25', category: 'Cenografia', name: 'Ativação NBB CAIXA', description: 'Cabines de basquete com placares e piso adesivado', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'sports_basketball', photos: [], checklist: [] },
    { id: 'cen-26', category: 'Cenografia', name: 'Balcão compensação de carbono', description: 'Estrutura em MDF com elétrica e tomadas', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'counter_tops', photos: [], checklist: [] },
    { id: 'cen-27', category: 'Cenografia', name: 'Totem de sinalização', description: 'Compensação de carbono', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'signpost', photos: [], checklist: [] },

    // Mobiliário (Page 2)
    { id: 'mob-01', category: 'Mobiliário', name: 'Mobiliário foyer e imprensa', description: 'Unifilas, cadeiras, poltronas, pufes, sofás e plantas', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'chair', photos: [], checklist: [] },
    { id: 'mob-02', category: 'Mobiliário', name: 'Mobiliário arena', description: 'Poltronas e mesas de apoio', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'event_seat', photos: [], checklist: [] },
    { id: 'mob-03', category: 'Mobiliário', name: 'Camarim VIP', description: 'Penteadeira, cadeiras, lounge e tapete', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'star', photos: [], checklist: [] },
    { id: 'mob-04', category: 'Mobiliário', name: 'Arranjos decorativos', description: 'Para restaurante', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'local_florist', photos: [], checklist: [] },
    { id: 'mob-05', category: 'Mobiliário', name: 'Banquetas altas', description: 'Para áreas de apoio', requiredQuantity: 6, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'chair_alt', photos: [], checklist: [] },
    { id: 'mob-06', category: 'Mobiliário', name: 'Locação de manequins', description: 'Masculino e feminino', requiredQuantity: 2, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'accessibility', photos: [], checklist: [] },

    // Equipamentos (Page 2)
    { id: 'eq-01', category: 'Equipamentos', name: 'Painéis de LED', description: 'Foyer e túneis com processamento e servidores dedicados', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'led_display', photos: [], checklist: [] },
    { id: 'eq-02', category: 'Equipamentos', name: 'Iluminação cênica e sonorização', description: 'Ambiente foyer', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'spotlight', photos: [], checklist: [] },
    { id: 'eq-03', category: 'Equipamentos', name: 'Sistema de LED espiral', description: 'Arena', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'blur_on', photos: [], checklist: [] },
    { id: 'eq-04', category: 'Equipamentos', name: 'Processamento de LED arena', description: 'Com servidores master e slave', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'memory', photos: [], checklist: [] },
    { id: 'eq-05', category: 'Equipamentos', name: 'Projeção mapeada', description: 'Em fundo de palco com projetores e processamento', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'videocam', photos: [], checklist: [] },
    { id: 'eq-06', category: 'Equipamentos', name: 'Teleprompter de palco', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'subtitles', photos: [], checklist: [] },
    { id: 'eq-07', category: 'Equipamentos', name: 'Captação de streaming', description: 'Com câmeras, ATEM, intercom e transmissão PT/EN', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'live_tv', photos: [], checklist: [] },
    { id: 'eq-08', category: 'Equipamentos', name: 'Sistema de tradução simultânea', description: 'Com cabines e receptores', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'translate', photos: [], checklist: [] },
    { id: 'eq-09', category: 'Equipamentos', name: 'Box truss aéreo', description: 'Com talhas', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'grid_on', photos: [], checklist: [] },
    { id: 'eq-10', category: 'Equipamentos', name: 'Iluminação cênica arena', description: 'Com consoles MA', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'light', photos: [], checklist: [] },
    { id: 'eq-11', category: 'Equipamentos', name: 'Plataformas elevatórias', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'elevator', photos: [], checklist: [] },
    { id: 'eq-12', category: 'Equipamentos', name: 'Sistema de áudio arena completo', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'speaker', photos: [], checklist: [] },
    // Equipamentos (Page 3)
    { id: 'eq-13', category: 'Equipamentos', name: 'In ear', description: 'Para mestre de cerimônia', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'hearing', photos: [], checklist: [] },
    { id: 'eq-14', category: 'Equipamentos', name: 'Rádio comunicador', description: '', requiredQuantity: 50, dailyRate: 3, currentQuantity: 0, status: 'Pendente', icon: 'radio', photos: [], checklist: [] },
    { id: 'eq-15', category: 'Equipamentos', name: 'Totens de credenciamento', description: 'Autoatendimento', requiredQuantity: 12, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'touch_app', photos: [], checklist: [] },
    { id: 'eq-16', category: 'Equipamentos', name: 'Celulares controle de kits - Matriz', description: '', requiredQuantity: 6, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'smartphone', photos: [], checklist: [] },
    { id: 'eq-17', category: 'Equipamentos', name: 'Celulares controle de kits - CICB', description: '', requiredQuantity: 5, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'smartphone', photos: [], checklist: [] },
    { id: 'eq-18', category: 'Equipamentos', name: 'Kit equipamentos credenciamento imprensa', description: '', requiredQuantity: 1, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'newspaper', photos: [], checklist: [] },
    { id: 'eq-19', category: 'Equipamentos', name: 'Leitores QR code de mesa', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'qr_code', photos: [], checklist: [] },
    { id: 'eq-20', category: 'Equipamentos', name: 'Plinko gigante', description: 'Painel LED touch com notebook', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'touch_app', photos: [], checklist: [] },
    { id: 'eq-21', category: 'Equipamentos', name: 'Totens de sinalização adicionais', description: '', requiredQuantity: 2, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'signpost', photos: [], checklist: [] },
    { id: 'eq-22', category: 'Equipamentos', name: 'Equipamento extra ACAP', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'add_box', photos: [], checklist: [] },

    // Material Promocional (Brindes) (Page 3-4) - Renamed from Promocional
    { id: 'prom-01', category: 'Material Promocional', name: 'Ecobag em brim personalizada', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'shopping_bag', photos: [], checklist: [] },
    { id: 'prom-02', category: 'Material Promocional', name: 'Tag ecobag', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'label', photos: [], checklist: [] },
    { id: 'prom-03', category: 'Material Promocional', name: 'Camiseta personalizada DTF (lote 1)', description: '', requiredQuantity: 2200, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },
    { id: 'prom-04', category: 'Material Promocional', name: 'Camiseta personalizada DTF (lote 2)', description: '', requiredQuantity: 2200, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },
    { id: 'prom-05', category: 'Material Promocional', name: 'Crachá PVC com cordão', description: '', requiredQuantity: 1600, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'badge', photos: [], checklist: [] },
    { id: 'prom-06', category: 'Material Promocional', name: 'Garrafa inox personalizada', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'water_bottle', photos: [], checklist: [] },
    { id: 'prom-07', category: 'Material Promocional', name: 'Pulseira de identificação', description: 'Em tecido', requiredQuantity: 200, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'watch', photos: [], checklist: [] },
    { id: 'prom-08', category: 'Material Promocional', name: 'Caneca esmaltada personalizada', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'coffee', photos: [], checklist: [] },
    { id: 'prom-09', category: 'Material Promocional', name: 'Embalagem de pano para caneca', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'inventory_2', photos: [], checklist: [] },
    { id: 'prom-10', category: 'Material Promocional', name: 'Tag caneca', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'label', photos: [], checklist: [] },
    { id: 'prom-11', category: 'Material Promocional', name: 'Pin metálico personalizado', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'verified', photos: [], checklist: [] },
    { id: 'prom-12', category: 'Material Promocional', name: 'Bolsa academia couro premium', description: '', requiredQuantity: 300, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'shopping_bag', photos: [], checklist: [] },
    { id: 'prom-13', category: 'Material Promocional', name: 'Kindler 11g', description: '', requiredQuantity: 130, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'menu_book', photos: [], checklist: [] },
    { id: 'prom-14', category: 'Material Promocional', name: 'Fone JBL Tune 520bt', description: '', requiredQuantity: 200, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'headphones', photos: [], checklist: [] },
    { id: 'prom-15', category: 'Material Promocional', name: 'Mala Volaris', description: '', requiredQuantity: 100, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'luggage', photos: [], checklist: [] },
    { id: 'prom-16', category: 'Material Promocional', name: 'Echo Dot 5ª geração', description: '', requiredQuantity: 100, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'speaker', photos: [], checklist: [] },
    { id: 'prom-17', category: 'Material Promocional', name: 'Mala de bordo ABS', description: '', requiredQuantity: 300, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'luggage', photos: [], checklist: [] },
    { id: 'prom-18', category: 'Material Promocional', name: 'Mochila couro sintético', description: '', requiredQuantity: 300, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'backpack', photos: [], checklist: [] },
    { id: 'prom-19', category: 'Material Promocional', name: 'Echo Pop', description: '', requiredQuantity: 200, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'speaker', photos: [], checklist: [] },
    { id: 'prom-20', category: 'Material Promocional', name: 'Caneca térmica podcast', description: '', requiredQuantity: 50, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'coffee', photos: [], checklist: [] },

    // Comunicação Gráfica (Page 4)
    { id: 'graf-01', category: 'Comunicação Gráfica', name: 'Ficha de palco impressa', description: '', requiredQuantity: 200, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'description', photos: [], checklist: [] },
    { id: 'graf-02', category: 'Comunicação Gráfica', name: 'Prisma gráfico para lojinha', description: '', requiredQuantity: 60, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'change_history', photos: [], checklist: [] },

    // Comunicação Têxtil (Page 4)
    { id: 'text-01', category: 'Comunicação Têxtil', name: 'Agasalho em moletom', description: '', requiredQuantity: 50, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },
    { id: 'text-02', category: 'Comunicação Têxtil', name: 'Calça em moletom', description: '', requiredQuantity: 50, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },
    { id: 'text-03', category: 'Comunicação Têxtil', name: 'Camisa polo', description: '', requiredQuantity: 50, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },
    { id: 'text-04', category: 'Comunicação Têxtil', name: 'Camiseta personalizada (lote extra 1)', description: '', requiredQuantity: 20, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },
    { id: 'text-05', category: 'Comunicação Têxtil', name: 'Camiseta personalizada (lote extra 2)', description: '', requiredQuantity: 7, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'checkroom', photos: [], checklist: [] },

    // Comunicação Digital (Page 4)
    { id: 'dig-01', category: 'Comunicação Digital', name: 'Aplicativo do evento', description: '2 meses', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'install_mobile', photos: [], checklist: [] },
    { id: 'dig-02', category: 'Comunicação Digital', name: 'Conteúdo digital mapping', description: 'Produção para indoor', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'animation', photos: [], checklist: [] },
    { id: 'dig-03', category: 'Comunicação Digital', name: 'Motion gráfico', description: 'Para arena e túneis', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'movie_filter', photos: [], checklist: [] },
    { id: 'dig-04', category: 'Comunicação Digital', name: 'Controle de acesso digital', description: 'Sistema', requiredQuantity: 32, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'qr_code_scanner', photos: [], checklist: [] },
    { id: 'dig-05', category: 'Comunicação Digital', name: 'Programação do jogo Plinko', description: 'Digital', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'code', photos: [], checklist: [] },

    // Foto e Filmagem (Page 5)
    { id: 'foto-01', category: 'Foto e Filmagem', name: 'Fotografia com tratamento', description: 'Serviço com recorte', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'photo_camera', photos: [], checklist: [] },

    // Serviços Técnicos (Page 5)
    { id: 'tec-01', category: 'Serviços Técnicos', name: 'Social Media', description: 'Para produção de conteúdo', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'share', photos: [], checklist: [] },
    { id: 'tec-02', category: 'Serviços Técnicos', name: 'Web Designer', description: 'Para materiais do app', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'web', photos: [], checklist: [] },
    { id: 'tec-03', category: 'Serviços Técnicos', name: 'Concierge', description: 'Para confirmação de participantes', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'support_agent', photos: [], checklist: [] },
    { id: 'tec-04', category: 'Serviços Técnicos', name: 'Despachante', description: 'Para trâmites legais e alvarás', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'gavel', photos: [], checklist: [] },
    { id: 'tec-05', category: 'Serviços Técnicos', name: 'Eletricista', description: '', requiredQuantity: 1, dailyRate: 3, currentQuantity: 0, status: 'Pendente', icon: 'electrical_services', photos: [], checklist: [] },
    { id: 'tec-06', category: 'Serviços Técnicos', name: 'Equipe cabelo e maquiagem', description: '', requiredQuantity: 2, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'face', photos: [], checklist: [] },
    { id: 'tec-07', category: 'Serviços Técnicos', name: 'Direção de palco', description: 'Coordenação', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'director_chair', photos: [], checklist: [] },

    // Recursos Humanos (Page 5)
    { id: 'rh-01', category: 'Recursos Humanos', name: 'Equipe técnica de palco', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'engineering', photos: [], checklist: [] },
    { id: 'rh-02', category: 'Recursos Humanos', name: 'Promotores de entrada', description: '', requiredQuantity: 57, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'groups', photos: [], checklist: [] },
    { id: 'rh-03', category: 'Recursos Humanos', name: 'Limpeza', description: '', requiredQuantity: 4, dailyRate: 4, currentQuantity: 0, status: 'Pendente', icon: 'cleaning_services', photos: [], checklist: [] },
    { id: 'rh-04', category: 'Recursos Humanos', name: 'Segurança diurno', description: '', requiredQuantity: 22, dailyRate: 4, currentQuantity: 0, status: 'Pendente', icon: 'security', photos: [], checklist: [] },
    { id: 'rh-05', category: 'Recursos Humanos', name: 'Segurança noturno', description: '', requiredQuantity: 12, dailyRate: 4, currentQuantity: 0, status: 'Pendente', icon: 'security', photos: [], checklist: [] },
    { id: 'rh-06', category: 'Recursos Humanos', name: 'Coordenador foyer', description: '', requiredQuantity: 1, dailyRate: 3, currentQuantity: 0, status: 'Pendente', icon: 'person', photos: [], checklist: [] },
    { id: 'rh-07', category: 'Recursos Humanos', name: 'Coordenador plenária', description: '', requiredQuantity: 1, dailyRate: 3, currentQuantity: 0, status: 'Pendente', icon: 'person', photos: [], checklist: [] },
    { id: 'rh-08', category: 'Recursos Humanos', name: 'Coordenador restaurante', description: '', requiredQuantity: 1, dailyRate: 3, currentQuantity: 0, status: 'Pendente', icon: 'person', photos: [], checklist: [] },
    { id: 'rh-09', category: 'Recursos Humanos', name: 'Coordenador coquetel', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'person', photos: [], checklist: [] },
    { id: 'rh-10', category: 'Recursos Humanos', name: 'Brigadistas', description: '', requiredQuantity: 6, dailyRate: 5, currentQuantity: 0, status: 'Pendente', icon: 'medical_services', photos: [], checklist: [] },
    { id: 'rh-11', category: 'Recursos Humanos', name: 'Carregadores', description: '', requiredQuantity: 10, dailyRate: 5, currentQuantity: 0, status: 'Pendente', icon: 'trolley', photos: [], checklist: [] },
    { id: 'rh-12', category: 'Recursos Humanos', name: 'Montagem welcome kit - matriz', description: '', requiredQuantity: 6, dailyRate: 5, currentQuantity: 0, status: 'Pendente', icon: 'inventory', photos: [], checklist: [] },
    { id: 'rh-13', category: 'Recursos Humanos', name: 'Montagem welcome kit - hotel', description: '', requiredQuantity: 3, dailyRate: 3, currentQuantity: 0, status: 'Pendente', icon: 'inventory', photos: [], checklist: [] },

    // Serviços Artísticos (Page 6)
    { id: 'art-01', category: 'Serviços Artísticos', name: 'Mestre de cerimônia', description: 'Paulo Vieira', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'mic_external_on', photos: [], checklist: [] },
    { id: 'art-02', category: 'Serviços Artísticos', name: 'Palestrante - Brett King', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'record_voice_over', photos: [], checklist: [] },
    { id: 'art-03', category: 'Serviços Artísticos', name: 'Palestrante - Maha Mamo', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'record_voice_over', photos: [], checklist: [] },
    { id: 'art-04', category: 'Serviços Artísticos', name: 'Artista - Fafá de Belém', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'music_note', photos: [], checklist: [] },
    { id: 'art-05', category: 'Serviços Artísticos', name: 'Artista - Maikon Pinheiro', description: '', requiredQuantity: 1, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'music_note', photos: [], checklist: [] },

    // A&B (Page 6)
    { id: 'ab-01', category: 'A&B', name: 'Café personalizado - almoço', description: '', requiredQuantity: 1000, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'coffee', photos: [], checklist: [] },
    { id: 'ab-02', category: 'A&B', name: 'Café personalizado - coquetel', description: '', requiredQuantity: 1000, dailyRate: 1, currentQuantity: 0, status: 'Pendente', icon: 'local_bar', photos: [], checklist: [] },

    // Outros (Page 6)
    { id: 'out-01', category: 'Outros', name: 'Ambulância UTI', description: 'Com médico', requiredQuantity: 1, dailyRate: 5, currentQuantity: 0, status: 'Pendente', icon: 'ambulance', photos: [], checklist: [] },
    { id: 'out-02', category: 'Outros', name: 'Posto médico', description: '', requiredQuantity: 1, dailyRate: 2, currentQuantity: 0, status: 'Pendente', icon: 'local_hospital', photos: [], checklist: [] }
];

const INITIAL_EMPTY_ITEMS: Item[] = []; 

// --- Components ---

// 1. Login Component
const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
        setError('Preencha usuário e senha');
        return;
    }
    
    // Simulação de verificação. No ambiente real, validaria com o backend.
    if (password.length > 3) {
        // Enviar log de acesso ao DB
        sendToDatabase({ action: 'login', data: { email, timestamp: new Date() } });
        onLogin();
    } else {
        setError('Senha inválida');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-6 font-sans">
        <div className="w-full max-w-sm flex flex-col items-center">
        <div className="mb-10 flex items-center justify-center">
            {/* Logo Increased 20-25% via scale-125 */}
            <img 
                src="https://agenciavaliant.sharepoint.com/:i:/s/Valiant/IQBAV-hO19qzQp5gb-AKdxgyAXJqj3lOVu7uGcfYxkMfF9k?e=Ridr6f&download=1" 
                alt="Valiant" 
                className="h-24 w-auto object-contain transform scale-125"
            />
        </div>
        
        <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Valiant. Report</h1>
            <p className="text-slate-500 text-sm">ÁREA RESTRITA</p>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden p-6 space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuário</label>
                <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-[20px]">person</span>
                <input 
                    type="email" 
                    placeholder="usuario@valiant.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 block w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 text-sm py-3.5 transition-all" 
                />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-[20px]">lock</span>
                <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 block w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 text-sm py-3.5 transition-all" 
                />
                </div>
            </div>
            
            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <button onClick={handleLogin} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-slate-900/10 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98]">
                Entrar
            </button>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Versão 1.0.5</p>
        </div>
        </div>
    </div>
  );
};

// 2. Event List Component
const EventList = ({ onSelectEvent, onLogout }: { onSelectEvent: (e: Event) => void, onLogout: () => void }) => {
  const [filter, setFilter] = useState<'Todos' | 'Pendentes' | 'Em Andamento' | 'Concluídos'>('Todos');
  const [showMenu, setShowMenu] = useState(false);

  // UPDATED EVENTS LIST
  const events: Event[] = [
    { 
        id: 'cx-2025', 
        title: 'Evento Institucional 2025', 
        description: 'Encontro estratégico nacional de líderes CAIXA', 
        date: '16 e 17/12', 
        location: 'CICB - Brasília, DF', 
        status: 'Em Execução', 
        progress: 15, 
        icon: 'campaign',
        image: 'https://i.imgur.com/Kz8qf6x.png' 
    },
    { 
        id: 'es-2025', 
        title: 'ESPAÇO DA SORTE 2025', 
        description: 'Ativações do Espaço da Sorte', 
        date: '01/09/2025 a 12/12/2025', 
        location: 'São Paulo', 
        status: 'Concluído', 
        progress: 100, 
        icon: 'theater_comedy', 
        image: '' 
    },
    { 
        id: 'qu-2025', 
        title: 'QUINA DE SÃO JOÃO', 
        description: 'Ativações do Sorteio da Quina', 
        date: '01/08/2025 a 31/08/2025', 
        location: 'Nacional', 
        status: 'Concluído', 
        progress: 100, 
        icon: 'casino', 
        image: '' 
    },
    { 
        id: 'cb-2025', 
        title: 'CBG RIO MUNDIAL', 
        description: 'Ativação das Loterias CAIXA', 
        date: 'Ago 2025', 
        location: 'Rio de Janeiro', 
        status: 'Concluído', 
        progress: 100, 
        icon: 'confirmation_number', 
        image: '' 
    },
    { 
        id: 'pr-2025', 
        title: 'PREMIO COB - BROWNIES', 
        description: 'Ativação da CAIXA Loterias', 
        date: 'Dez 2025', 
        location: 'São Paulo', 
        status: 'Concluído', 
        progress: 100, 
        icon: 'inventory_2', 
        image: '' 
    }
  ];

  const filteredEvents = events.filter(e => {
      if (filter === 'Todos') return true;
      if (filter === 'Pendentes') return e.status === 'Pendente' || e.status === 'Agendado';
      if (filter === 'Em Andamento') return e.status === 'Em Execução';
      if (filter === 'Concluídos') return e.status === 'Concluído';
      return true;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-6 font-sans">
      <header className="bg-white sticky top-0 z-20 px-6 py-5 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Lista de Eventos</h2>
        <div className="flex items-center gap-3">
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                <span className="material-symbols-outlined text-slate-600">notifications</span>
            </button>
            <div className="relative">
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-800">more_vert</span>
                </button>
                
                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                {/* Fixed icon class to outlined */}
                                <span className="material-symbols-outlined text-[20px] text-slate-400">event_note</span> Eventos
                            </button>
                            <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400">photo_camera</span> Fotos
                            </button>
                            <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400">person</span> Perfil
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span> Sair
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>
      
      <div className="px-6 mt-6">
        <div className="flex items-center rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-3.5">
          <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
          <input className="bg-transparent border-none w-full text-slate-900 placeholder-slate-400 focus:ring-0 p-0 text-sm" placeholder="Buscar por nome ou data..." />
        </div>
      </div>

      <div className="px-6 mt-6">
          <div className="relative">
              <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3.5 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent font-bold text-sm shadow-sm"
              >
                  <option value="Todos">Todos os Eventos</option>
                  <option value="Pendentes">Pendentes</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluídos">Concluídos</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
          </div>
      </div>

      <div className="flex flex-col gap-5 p-6">
        {filteredEvents.map(evt => {
            const isEnabled = evt.id === 'cx-2025';
            return (
            <div key={evt.id} className={`bg-white rounded-2xl border border-slate-100 shadow-card flex flex-col overflow-hidden relative ${!isEnabled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                
                {/* Updated Cover Image Logic - Ensure it renders fully if present */}
                {evt.image ? (
                    <div className="w-full h-32 bg-slate-100 relative">
                        <img src={evt.image} className="w-full h-full object-cover" alt={evt.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                ) : (
                    <div className="h-4 bg-slate-50 w-full border-b border-slate-50"></div>
                )}

                <div className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-900 leading-snug max-w-[80%]">{evt.title}</h3>
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 shrink-0">
                            <span className="material-symbols-outlined text-[18px]">{evt.icon}</span>
                        </div>
                    </div>
                    
                    <p className="text-sm text-slate-500 leading-relaxed">{evt.description}</p>

                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-md text-xs font-medium text-slate-600 border border-slate-100">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span> {evt.date}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-md text-xs font-medium text-slate-600 border border-slate-100">
                            <span className="material-symbols-outlined text-[14px]">location_on</span> {evt.location}
                        </div>
                    </div>
                    
                    {evt.status === 'Em Execução' && (
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-slate-500 font-medium">Progresso</span>
                                <span className="text-slate-900 font-bold">{evt.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${evt.progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-1">
                        {isEnabled ? (
                            <button onClick={() => onSelectEvent(evt)} className="col-span-2 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
                                Acessar
                            </button>
                        ) : (
                            <button disabled className="col-span-2 py-2.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-bold border border-slate-200 cursor-not-allowed">
                                {evt.status === 'Concluído' ? 'Finalizado' : 'Bloqueado'}
                            </button>
                        )}
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${evt.status === 'Concluído' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-700'}`}>
                            {evt.status}
                        </span>
                    </div>
                </div>
            </div>
            );
        })}
      </div>
    </div>
  );
};

// 3. Event Detail Component
const EventDetail = ({ event, items, onBack, onSelectItem, onUpdateEvent, onUpdateItems }: { event: Event, items: Item[], onBack: () => void, onSelectItem: (item: Item) => void, onUpdateEvent: (e: Event) => void, onUpdateItems: (items: Item[]) => void }) => {
  const completedCount = items.filter(i => i.status === 'Concluído').length;
  // Handle 0 items case for progress
  const progress = items.length > 0 ? (Math.round((completedCount / items.length) * 100)) : 0;
  
  const [showCongrats, setShowCongrats] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State for dropdown menu
  const [showEditModal, setShowEditModal] = useState(false); // Edit Event Modal
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDesc, setEditDesc] = useState(event.description);

  const headerInputRef = useRef<HTMLInputElement>(null);
  const baseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (progress === 100 && items.length > 0) {
        setShowCongrats(true);
    }
  }, [progress, items.length]);
  
  // Group items by category and sort keys alphabetically, moving "Outros" to the end
  const groupedItems = items.reduce((acc, item) => {
      const cat = item.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
  }, {} as Record<string, Item[]>);

  const sortedCategories = Object.entries(groupedItems).sort(([catA], [catB]) => {
      if (catA === 'Outros') return 1;
      if (catB === 'Outros') return -1;
      return catA.localeCompare(catB);
  });

  const toggleCategory = (category: string) => {
      setExpandedCategories(prev => ({
          ...prev,
          [category]: !prev[category]
      }));
  };

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              onUpdateEvent({ ...event, image: base64 });
              setShowMenu(false);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          // Simulate parsing delay and populating data
          setTimeout(() => {
              // In a real app, we would parse the file here.
              // For now, we load the "Full" mock data.
              onUpdateItems(FULL_IMPORTED_ITEMS);
              alert("Base carregada com sucesso! Itens e categorias foram importados.");
              setShowMenu(false);
          }, 1000);
      }
  };
  
  const handleSaveEventDetails = () => {
      onUpdateEvent({ ...event, title: editTitle, description: editDesc });
      setShowEditModal(false);
  };

  // Use event image for header if available, else mock
  const headerImage = event.image || MOCK_EVENT_IMG;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full animate-[bounce-in_0.5s]">
                <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl text-amber-400">emoji_events</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Parabéns!</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Todos os itens foram incluídos. Agora é só montar o Relatório de Execução com todo o material.</p>
                <button onClick={() => setShowCongrats(false)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800">Entendido</button>
            </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Editar Evento</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                        <input 
                            type="text" 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                        <textarea 
                            value={editDesc} 
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-800 resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Cancelar</button>
                    <button onClick={handleSaveEventDetails} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm">Salvar</button>
                </div>
            </div>
        </div>
      )}

      {/* Header Image Overlay */}
      <div className="relative h-64 w-full bg-slate-900 group">
          <img src={headerImage} className="w-full h-full object-cover opacity-60 transition-opacity" alt="Header" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
          
          {/* Header Action Buttons (Simplified) */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
            <button onClick={onBack} className="p-2 transition-opacity hover:opacity-80">
                <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
            </button>
            
            <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 transition-opacity hover:opacity-80">
                    <span className="material-symbols-outlined text-white text-[28px]">more_vert</span>
                </button>
                
                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                             <button 
                                onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                                className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                             >
                                <span className="material-symbols-outlined text-[20px] text-slate-400">edit_note</span> Editar Evento
                            </button>
                             <button 
                                onClick={() => headerInputRef.current?.click()}
                                className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                             >
                                <span className="material-symbols-outlined text-[20px] text-slate-400">image</span> Editar Capa
                            </button>
                            <button 
                                onClick={() => baseInputRef.current?.click()}
                                className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                             >
                                <span className="material-symbols-outlined text-[20px] text-slate-400">upload_file</span> Carregar Base
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>

          <input 
             type="file" 
             ref={headerInputRef} 
             className="hidden" 
             accept="image/*"
             onChange={handleHeaderImageUpload} 
          />
           <input 
             type="file" 
             ref={baseInputRef} 
             className="hidden" 
             accept=".xlsx,.xls,.csv,.pdf" // Simulating accepted base files
             onChange={handleBaseUpload} 
          />
          
          <div className="absolute bottom-0 left-0 w-full p-6 z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 border border-white/10">
                  {event.status === 'Em Execução' ? 'Em Andamento' : event.status}
              </span>
              <h1 className="text-2xl font-bold text-white mb-1 shadow-sm leading-tight pr-12">{event.title}</h1>
              {/* Added Description Paragraph */}
              <p className="text-white/80 text-sm font-medium leading-relaxed pr-8 max-w-lg">{event.description}</p>
          </div>
      </div>

      <div className="flex-1 -mt-6 rounded-t-3xl bg-slate-50 relative z-10 p-6 pb-24 overflow-y-auto">
        
        {/* Info Row - Added margin top to increase spacing from header */}
        <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Data</p>
                    <p className="text-sm font-bold text-slate-900">{event.date}</p>
                </div>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Local</p>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{event.location}</p>
                </div>
            </div>
        </div>

        {/* New Centered Progress Card Layout */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 text-center">
            
            <div className="flex flex-col items-center justify-center mb-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">{progress}%</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Concluído</span>
                </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-slate-800 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                <span>0</span>
                <span>{items.length}</span>
            </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
             {/* Updated Category Title Style */}
             <h3 className="text-lg font-bold text-slate-900">Categorias</h3>
        </div>

        {/* Categorized Items List (Accordion) */}
        {items.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                 <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-slate-400">upload_file</span>
                 </div>
                <p className="text-sm text-slate-500 font-medium">Nenhum item carregado.</p>
                <p className="text-xs text-slate-400 mt-1">Carregue a base no menu acima.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {sortedCategories.map(([category, catItems]) => {
                    const isOpen = expandedCategories[category];
                    const catCompleted = catItems.filter(i => i.status === 'Concluído').length;
                    const catTotal = catItems.length;

                    return (
                        <div key={category} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                            <button 
                                onClick={() => toggleCategory(category)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Added Category Icon */}
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                                        <span className="material-symbols-outlined text-[18px]">{getCategoryIcon(category)}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 text-left leading-tight">{category}</span>
                                </div>
                                
                                {/* Updated Counter: No background circle, moved near arrow, format X/Y */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">
                                        {catCompleted}/{catTotal}
                                    </span>
                                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                        keyboard_arrow_down
                                    </span>
                                </div>
                            </button>
                            
                            {isOpen && (
                                <div className="p-4 pt-0 border-t border-slate-50 animate-in fade-in slide-in-from-top-1">
                                    <div className="space-y-3 mt-4">
                                        {catItems.map(item => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => onSelectItem(item)} // Whole row is clickable
                                                className={`bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-center gap-3 transition-all cursor-pointer ${item.status === 'Concluído' ? 'opacity-60 grayscale bg-transparent' : 'hover:border-slate-300 hover:bg-slate-100'}`}
                                            >
                                                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100 relative">
                                                    {/* Changed: Always show item icon, never check_circle */}
                                                    <span className="material-symbols-outlined text-slate-600 text-[20px]">{item.icon}</span>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-bold text-slate-900 text-xs truncate ${item.status === 'Concluído' ? 'line-through decoration-slate-400' : ''}`}>{item.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Concluído' ? 'bg-green-500' : (item.photos.length > 0 ? 'bg-blue-500' : 'bg-slate-300')}`}></div>
                                                        <span className="text-[10px] font-medium text-slate-500 uppercase">{item.status}</span>
                                                    </div>
                                                </div>

                                                <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

// 4. Item Detail & Camera Component
const ItemDetail = ({ item, event, onBack, onUpdateItem }: { item: Item, event: Event, onBack: () => void, onUpdateItem: (updated: Item) => void }) => {
    // analyzing state removed from UI usage basically
    const [includeTimestamp, setIncludeTimestamp] = useState(true);
    const [includeGeo, setIncludeGeo] = useState(false);
    const [customLocation, setCustomLocation] = useState<string>("Salão Principal"); // Default manual location
    
    // UI States for Discrepancy
    const [discrepancyData, setDiscrepancyData] = useState<{count: number, reason: string} | null>(null);

    // Image Viewer State
    const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };
    
    // Função para obter GPS se necessário
    const getGPSCoordinates = (): Promise<string> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve("GPS não suportado");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
                },
                (error) => {
                    resolve("Erro GPS");
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    };

    const processImage = async (file: File) => {
        setDiscrepancyData(null);
        
        // 1. Determine Location String based on User Preference
        let finalLocation = undefined;
        if (includeGeo) {
            if (customLocation.trim().length > 0) {
                // User typed something, use it
                finalLocation = customLocation;
            } else {
                // User didn't type, fetch GPS
                finalLocation = await getGPSCoordinates();
            }
        }
        
        // 2. Read File
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;

            const newPhoto: Photo = {
                id: Date.now().toString(),
                url: base64,
                isVerified: true, 
                hasWarning: false,
                timestamp: includeTimestamp ? new Date().toLocaleString() : undefined,
                coords: finalLocation
            };

            const updatedPhotos = [...item.photos, newPhoto];
            const newItemState = {
                ...item,
                photos: updatedPhotos,
                status: (updatedPhotos.length >= 1 ? 'Análise' : 'Pendente') as ItemStatus
            };
            
            // 3. Save to Database (Async, don't block UI)
            sendToDatabase({ 
                action: 'save_item', 
                data: { itemId: item.id, eventId: event.id, photo: newPhoto } 
            });

            onUpdateItem(newItemState);
        };
        reader.readAsDataURL(file);
    };

    const handleFinishItem = () => {
        if (confirm("Deseja encerrar este item?")) {
            onUpdateItem({ ...item, status: 'Concluído' });
            onBack();
        }
    };

    const handlePrevImage = () => {
        if (viewingPhotoIndex !== null && viewingPhotoIndex > 0) {
            setViewingPhotoIndex(viewingPhotoIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (viewingPhotoIndex !== null && viewingPhotoIndex < item.photos.length - 1) {
            setViewingPhotoIndex(viewingPhotoIndex + 1);
        }
    };
    
    // Helper to get current viewing photo safely
    const viewingPhoto = viewingPhotoIndex !== null ? item.photos[viewingPhotoIndex] : null;

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans relative">
            
            {/* Image Viewer Carousel Modal */}
            {viewingPhoto && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
                    <button 
                        onClick={() => setViewingPhotoIndex(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
                    >
                        <span className="material-symbols-outlined text-white text-[24px]">close</span>
                    </button>

                    <div className="w-full flex-1 flex items-center justify-between px-2 relative">
                         {item.photos.length > 1 && (
                             <button 
                                onClick={handlePrevImage}
                                disabled={viewingPhotoIndex === 0}
                                className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all ${viewingPhotoIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'} z-20`}
                             >
                                <span className="material-symbols-outlined text-white text-[32px]">chevron_left</span>
                             </button>
                         )}

                         <div className="flex-1 h-full flex items-center justify-center p-4 relative">
                             <img 
                                src={viewingPhoto.url} 
                                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl" 
                                alt="View"
                             />
                             
                             {/* OVERLAY MASK - Event Info, Location, Date */}
                             {/* Logic: Only show if at least one metadata exists */}
                             {(viewingPhoto.timestamp || viewingPhoto.coords) && (
                                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-10 rounded-b-lg">
                                    <h3 className="font-bold text-lg leading-tight mb-1">{event.title}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium opacity-90">
                                        {viewingPhoto.coords && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {viewingPhoto.coords}
                                            </span>
                                        )}
                                        {viewingPhoto.timestamp && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {viewingPhoto.timestamp}
                                            </span>
                                        )}
                                    </div>
                                </div>
                             )}
                         </div>

                         {item.photos.length > 1 && (
                             <button 
                                onClick={handleNextImage}
                                disabled={viewingPhotoIndex === item.photos.length - 1}
                                className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all ${viewingPhotoIndex === item.photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'} z-20`}
                             >
                                <span className="material-symbols-outlined text-white text-[32px]">chevron_right</span>
                             </button>
                         )}
                    </div>
                    
                    {/* Caption/Counter */}
                    <div className="pb-8 pt-4 text-center">
                        <p className="text-white/80 text-sm font-medium">
                            {viewingPhotoIndex + 1} de {item.photos.length}
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full">
                        <span className="material-symbols-outlined text-slate-700">arrow_back_ios_new</span>
                    </button>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ITEM #{item.id}</p>
                        <h2 className="text-lg font-bold text-slate-900 truncate max-w-[200px]">{item.name}</h2>
                    </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-full">
                    <span className="material-symbols-outlined text-slate-700">more_vert</span>
                </button>
            </header>

            <div className="flex-1 p-5 pb-32 overflow-y-auto">
                
                {/* Updated Item Summary - "Resumo do Contrato" Removed, Image Removed, Added Qty/Daily */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">QTD</span>
                        <p className="text-lg font-bold text-slate-900">{item.requiredQuantity}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Diárias</span>
                        <p className="text-lg font-bold text-slate-900">{item.dailyRate}</p>
                    </div>
                     <div className="w-px h-8 bg-slate-100"></div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                         <p className="text-sm font-bold text-slate-700">{item.status}</p>
                    </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-6 px-1 leading-relaxed">{item.description}</p>

                {/* AI Warning Card - Conditional */}
                {discrepancyData && (
                    <div className="bg-white rounded-2xl p-5 shadow-card border border-red-100 mb-5">
                        <div className="flex items-start gap-3 mb-3">
                             <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                 <span className="material-symbols-outlined text-red-500">warning</span>
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-slate-900">Discrepância Detectada pela IA</h4>
                                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                     A análise da última foto identificou apenas <strong className="text-slate-900 underline decoration-red-300">{discrepancyData.count} itens</strong>. O contrato exige {item.requiredQuantity}.
                                 </p>
                             </div>
                        </div>
                        <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100">
                            Ver detalhes da contagem
                        </button>
                    </div>
                )}

                {/* Evidence Gallery */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Galeria de Evidências</h3>
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">
                        {item.photos.length} de {Math.max(5, item.requiredQuantity)} fotos
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                     {/* Camera Button */}
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-2xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                        {/* Spinner removed since AI is disabled */}
                        <>
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-800 text-[20px]">add_a_photo</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Nova Foto</span>
                        </>
                    </button>

                    {item.photos.map((photo, index) => (
                        <div 
                            key={photo.id} 
                            onClick={() => setViewingPhotoIndex(index)}
                            className="relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-100 group cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            <img src={photo.url} className={`w-full h-full object-cover transition-transform duration-500 ${photo.hasWarning ? 'grayscale-[0.5]' : ''}`} alt="Evidence" />
                            
                            {/* Metadata Overlay - THUMBNAIL (Simplified) */}
                            {/* Logic: Only show overlay if either timestamp OR coords exist */}
                            {(photo.timestamp || photo.coords) && (
                                <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col items-start justify-end">
                                    <span className="text-[8px] font-bold text-white leading-tight drop-shadow-sm">{event.title}</span>
                                    {photo.coords && <span className="text-[7px] font-medium text-white/90 leading-tight drop-shadow-sm">{photo.coords}</span>}
                                    {photo.timestamp && <span className="text-[7px] font-mono text-white/80 leading-tight drop-shadow-sm">{photo.timestamp}</span>}
                                </div>
                            )}

                            {/* Status Indicators on Photo */}
                            {photo.isVerified && !photo.hasWarning && (
                                <div className="absolute top-2 right-2 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                                    <span className="material-symbols-outlined text-white text-[12px]">check</span>
                                </div>
                            )}
                            {photo.hasWarning && (
                                <div className="absolute top-2 right-2 h-5 w-5 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                    <span className="text-amber-500 font-bold text-xs">!</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleFileUpload}
                />

                <button className="w-full py-3 mb-6 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">collections</span>
                    Adicionar da Galeria
                </button>

                {/* Metadata Settings */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-4">Metadados da Foto</h4>
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Carimbo de Data/Hora</p>
                                <p className="text-[10px] text-slate-500">Incluir timestamp na imagem</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => setIncludeTimestamp(!includeTimestamp)}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${includeTimestamp ? 'bg-slate-800' : 'bg-slate-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${includeTimestamp ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                                    <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Geolocalização</p>
                                    <p className="text-[10px] text-slate-500">Incluir localização na imagem</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => setIncludeGeo(!includeGeo)}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${includeGeo ? 'bg-slate-800' : 'bg-slate-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${includeGeo ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        {includeGeo && (
                            <div className="mt-4 pl-13 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Local da Captura</label>
                                <div className="relative">
                                     <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">edit_location</span>
                                     <input 
                                        type="text" 
                                        value={customLocation}
                                        onChange={(e) => setCustomLocation(e.target.value)}
                                        className="pl-9 w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-2.5 focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all placeholder-slate-400"
                                        placeholder="Digite o nome do local (ex: Salão Principal)"
                                     />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full p-5 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <button 
                    onClick={handleFinishItem}
                    disabled={item.photos.length === 0}
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/10 hover:bg-slate-900 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    Salvar e Continuar
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<'login' | 'list' | 'detail' | 'item'>('login');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [user, setUser] = useState<any>(null);

  // Initialize with EMPTY items (waiting for base upload) for the main event to demo the feature
  const [items, setItems] = useState<Item[]>([]);

  const handleLogin = () => {
      setUser({ name: 'Produtor', email: 'produtor@valiant.com' });
      setView('list');
  };
  
  const handleLogout = () => {
      setUser(null);
      setSelectedEvent(null);
      setSelectedItem(null);
      setView('login');
  };

  const handleSelectEvent = (evt: Event) => {
      // Logic to switch items based on event ID
      if (evt.id === 'cx-2025') {
          // Initialize empty to show the "Load Base" feature
          setItems([]);
      } else {
          setItems(INITIAL_EMPTY_ITEMS);
      }
      setSelectedEvent(evt);
      setView('detail');
  };
  
  const handleUpdateEvent = (updatedEvent: Event) => {
      setSelectedEvent(updatedEvent);
      // In a real app, you would also update the list of events here
  };
  
  const handleUpdateItems = (newItems: Item[]) => {
      setItems(newItems);
  };

  const handleSelectItem = (item: Item) => {
      if (item.status === 'Concluído') return; 
      setSelectedItem(item);
      setView('item');
  };

  const handleUpdateItem = (updated: Item) => {
      const newItems = items.map(i => i.id === updated.id ? updated : i);
      setItems(newItems);
      setSelectedItem(updated);
  };

  const handleBackToDetail = () => {
      setSelectedItem(null);
      setView('detail');
  };

  const handleBackToList = () => {
      setSelectedEvent(null);
      setView('list');
  };

  return (
    <div className="font-sans text-slate-900">
       {view === 'login' && <Login onLogin={handleLogin} />}
       {view === 'list' && <EventList onSelectEvent={handleSelectEvent} onLogout={handleLogout} />}
       {view === 'detail' && selectedEvent && (
           <EventDetail 
                event={selectedEvent} 
                items={items} 
                onBack={handleBackToList}
                onSelectItem={handleSelectItem}
                onUpdateEvent={handleUpdateEvent}
                onUpdateItems={handleUpdateItems}
           />
       )}
       {view === 'item' && selectedItem && selectedEvent && (
           <ItemDetail 
                item={selectedItem} 
                event={selectedEvent}
                onBack={handleBackToDetail}
                onUpdateItem={handleUpdateItem}
           />
       )}
    </div>
  );
};

export default App;