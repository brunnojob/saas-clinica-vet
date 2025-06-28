import { supabase, hashPassword } from '../lib/supabase';
import { User, Animal, Appointment, InventoryItem, Expense } from '../types';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`❌ Erro na operação ${operation}:`, error);
  
  if (error.code === '42501') {
    throw new Error('Erro de permissão no banco de dados. Verifique as configurações de segurança.');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Nenhum registro encontrado.');
  }
  
  throw new Error(error.message || `Erro na operação ${operation}`);
};

// Users Service
export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      console.log('📊 Buscando usuários...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, 'buscar usuários');
      }
      
      console.log(`✅ ${data?.length || 0} usuários encontrados`);
      return (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: new Date(user.created_at),
      }));
    } catch (error) {
      console.error('❌ Erro no serviço de usuários:', error);
      throw error;
    }
  },

  async create(user: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> {
    try {
      console.log('➕ Criando usuário:', user.email);
      
      // Hash da senha antes de salvar
      const hashedPassword = hashPassword(user.password);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          password: hashedPassword,
        })
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'criar usuário');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após criação do usuário');
      }
      
      console.log('✅ Usuário criado com sucesso:', data.id);
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('❌ Erro no serviço de criação de usuário:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User> & { password?: string }): Promise<User> {
    try {
      console.log('✏️ Atualizando usuário:', id);
      
      const updateData: any = {
        name: updates.name,
        email: updates.email,
        role: updates.role,
        avatar: updates.avatar,
        updated_at: new Date().toISOString(),
      };

      // Se uma nova senha foi fornecida, fazer hash dela
      if (updates.password) {
        updateData.password = hashPassword(updates.password);
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'atualizar usuário');
      }
      
      if (!data) {
        throw new Error('Usuário não encontrado para atualização');
      }
      
      console.log('✅ Usuário atualizado com sucesso');
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('❌ Erro no serviço de atualização de usuário:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Deletando usuário:', id);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) {
        handleSupabaseError(error, 'deletar usuário');
      }
      
      console.log('✅ Usuário deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de usuário:', error);
      throw error;
    }
  },
};

// Animals Service
export const animalsService = {
  async getAll(): Promise<Animal[]> {
    try {
      console.log('🐾 Buscando animais...');
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, 'buscar animais');
      }
      
      console.log(`✅ ${data?.length || 0} animais encontrados`);
      return (data || []).map(animal => ({
        id: animal.id,
        name: animal.name,
        species: animal.species,
        registrationNumber: animal.registration_number,
        age: animal.age,
        gender: animal.gender,
        weight: animal.weight,
        color: animal.color,
        ownerId: animal.id,
        owner: {
          id: animal.id,
          name: animal.owner_name,
          phone: animal.owner_phone,
          email: animal.owner_email || '',
          address: animal.owner_address || '',
          cpf: animal.owner_cpf || '',
        },
        createdAt: new Date(animal.created_at),
        isActive: animal.is_active,
      }));
    } catch (error) {
      console.error('❌ Erro no serviço de animais:', error);
      throw error;
    }
  },

  async create(animal: Omit<Animal, 'id' | 'createdAt' | 'ownerId'>): Promise<Animal> {
    try {
      console.log('➕ Criando animal:', animal.name);
      
      const { data, error } = await supabase
        .from('animals')
        .insert({
          name: animal.name,
          species: animal.species,
          registration_number: animal.registrationNumber || null,
          age: animal.age || 0,
          gender: animal.gender,
          weight: animal.weight || 0,
          color: animal.color || '',
          owner_name: animal.owner.name,
          owner_phone: animal.owner.phone,
          owner_email: animal.owner.email || null,
          owner_address: animal.owner.address || null,
          owner_cpf: animal.owner.cpf || null,
          is_active: animal.isActive ?? true,
        })
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'criar animal');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após criação do animal');
      }
      
      console.log('✅ Animal criado com sucesso:', data.id);
      return {
        id: data.id,
        name: data.name,
        species: data.species,
        registrationNumber: data.registration_number,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        color: data.color,
        ownerId: data.id,
        owner: {
          id: data.id,
          name: data.owner_name,
          phone: data.owner_phone,
          email: data.owner_email || '',
          address: data.owner_address || '',
          cpf: data.owner_cpf || '',
        },
        createdAt: new Date(data.created_at),
        isActive: data.is_active,
      };
    } catch (error) {
      console.error('❌ Erro no serviço de criação de animal:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Animal>): Promise<Animal> {
    try {
      console.log('✏️ Atualizando animal:', id);
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.species !== undefined) updateData.species = updates.species;
      if (updates.registrationNumber !== undefined) updateData.registration_number = updates.registrationNumber;
      if (updates.age !== undefined) updateData.age = updates.age;
      if (updates.gender !== undefined) updateData.gender = updates.gender;
      if (updates.weight !== undefined) updateData.weight = updates.weight;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      
      if (updates.owner) {
        if (updates.owner.name !== undefined) updateData.owner_name = updates.owner.name;
        if (updates.owner.phone !== undefined) updateData.owner_phone = updates.owner.phone;
        if (updates.owner.email !== undefined) updateData.owner_email = updates.owner.email;
        if (updates.owner.address !== undefined) updateData.owner_address = updates.owner.address;
        if (updates.owner.cpf !== undefined) updateData.owner_cpf = updates.owner.cpf;
      }
      
      const { data, error } = await supabase
        .from('animals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'atualizar animal');
      }
      
      if (!data) {
        throw new Error('Animal não encontrado para atualização');
      }
      
      console.log('✅ Animal atualizado com sucesso');
      return {
        id: data.id,
        name: data.name,
        species: data.species,
        registrationNumber: data.registration_number,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        color: data.color,
        ownerId: data.id,
        owner: {
          id: data.id,
          name: data.owner_name,
          phone: data.owner_phone,
          email: data.owner_email || '',
          address: data.owner_address || '',
          cpf: data.owner_cpf || '',
        },
        createdAt: new Date(data.created_at),
        isActive: data.is_active,
      };
    } catch (error) {
      console.error('❌ Erro no serviço de atualização de animal:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Deletando animal:', id);
      
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);
      
      if (error) {
        handleSupabaseError(error, 'deletar animal');
      }
      
      console.log('✅ Animal deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de animal:', error);
      throw error;
    }
  },
};

// Appointments Service
export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    try {
      console.log('📅 Buscando atendimentos...');
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, 'buscar atendimentos');
      }
      
      console.log(`✅ ${data?.length || 0} atendimentos encontrados`);
      return (data || []).map(appointment => ({
        id: appointment.id,
        medicalRecordId: appointment.animal_id,
        date: new Date(appointment.date),
        type: appointment.type,
        description: appointment.description,
        diagnosis: appointment.diagnosis,
        treatment: appointment.treatment,
        medications: appointment.medications || [],
        nextAppointment: appointment.next_appointment ? new Date(appointment.next_appointment) : undefined,
        veterinarianId: appointment.veterinarian_id,
        cost: appointment.cost || 0,
      }));
    } catch (error) {
      console.error('❌ Erro no serviço de atendimentos:', error);
      throw error;
    }
  },

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      console.log('➕ Criando atendimento');
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          animal_id: appointment.medicalRecordId,
          veterinarian_id: appointment.veterinarianId,
          date: appointment.date.toISOString(),
          type: appointment.type,
          description: appointment.description,
          diagnosis: appointment.diagnosis || null,
          treatment: appointment.treatment || null,
          medications: appointment.medications || [],
          next_appointment: appointment.nextAppointment?.toISOString() || null,
          cost: appointment.cost || 0,
        })
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'criar atendimento');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após criação do atendimento');
      }
      
      console.log('✅ Atendimento criado com sucesso:', data.id);
      return {
        id: data.id,
        medicalRecordId: data.animal_id,
        date: new Date(data.date),
        type: data.type,
        description: data.description,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        medications: data.medications || [],
        nextAppointment: data.next_appointment ? new Date(data.next_appointment) : undefined,
        veterinarianId: data.veterinarian_id,
        cost: data.cost || 0,
      };
    } catch (error) {
      console.error('❌ Erro no serviço de criação de atendimento:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      console.log('✏️ Atualizando atendimento:', id);
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.medicalRecordId !== undefined) updateData.animal_id = updates.medicalRecordId;
      if (updates.veterinarianId !== undefined) updateData.veterinarian_id = updates.veterinarianId;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString();
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.diagnosis !== undefined) updateData.diagnosis = updates.diagnosis;
      if (updates.treatment !== undefined) updateData.treatment = updates.treatment;
      if (updates.medications !== undefined) updateData.medications = updates.medications;
      if (updates.nextAppointment !== undefined) updateData.next_appointment = updates.nextAppointment?.toISOString();
      if (updates.cost !== undefined) updateData.cost = updates.cost;
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'atualizar atendimento');
      }
      
      if (!data) {
        throw new Error('Atendimento não encontrado para atualização');
      }
      
      console.log('✅ Atendimento atualizado com sucesso');
      return {
        id: data.id,
        medicalRecordId: data.animal_id,
        date: new Date(data.date),
        type: data.type,
        description: data.description,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        medications: data.medications || [],
        nextAppointment: data.next_appointment ? new Date(data.next_appointment) : undefined,
        veterinarianId: data.veterinarian_id,
        cost: data.cost || 0,
      };
    } catch (error) {
      console.error('❌ Erro no serviço de atualização de atendimento:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Deletando atendimento:', id);
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        handleSupabaseError(error, 'deletar atendimento');
      }
      
      console.log('✅ Atendimento deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de atendimento:', error);
      throw error;
    }
  },
};

// Inventory Service
export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    try {
      console.log('📦 Buscando itens do estoque...');
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        handleSupabaseError(error, 'buscar itens do estoque');
      }
      
      console.log(`✅ ${data?.length || 0} itens encontrados`);
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        category: item.category || '',
        quantity: item.quantity || 0,
        minQuantity: item.min_quantity || 0,
        unit: item.unit || 'unidade',
        expirationDate: item.expiration_date ? new Date(item.expiration_date) : undefined,
        cost: item.cost || 0,
        supplier: item.supplier || '',
        location: item.location || '',
      }));
    } catch (error) {
      console.error('❌ Erro no serviço de estoque:', error);
      throw error;
    }
  },

  async create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    try {
      console.log('➕ Criando item do estoque:', item.name);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: item.name,
          type: item.type,
          category: item.category || '',
          quantity: item.quantity || 0,
          min_quantity: item.minQuantity || 0,
          unit: item.unit || 'unidade',
          expiration_date: item.expirationDate?.toISOString().split('T')[0] || null,
          cost: item.cost || 0,
          supplier: item.supplier || null,
          location: item.location || null,
        })
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'criar item do estoque');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após criação do item');
      }
      
      console.log('✅ Item criado com sucesso:', data.id);
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        category: data.category || '',
        quantity: data.quantity || 0,
        minQuantity: data.min_quantity || 0,
        unit: data.unit || 'unidade',
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        cost: data.cost || 0,
        supplier: data.supplier || '',
        location: data.location || '',
      };
    } catch (error) {
      console.error('❌ Erro no serviço de criação de item do estoque:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      console.log('✏️ Atualizando item do estoque:', id);
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.minQuantity !== undefined) updateData.min_quantity = updates.minQuantity;
      if (updates.unit !== undefined) updateData.unit = updates.unit;
      if (updates.expirationDate !== undefined) updateData.expiration_date = updates.expirationDate?.toISOString().split('T')[0];
      if (updates.cost !== undefined) updateData.cost = updates.cost;
      if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
      if (updates.location !== undefined) updateData.location = updates.location;
      
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'atualizar item do estoque');
      }
      
      if (!data) {
        throw new Error('Item não encontrado para atualização');
      }
      
      console.log('✅ Item atualizado com sucesso');
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        category: data.category || '',
        quantity: data.quantity || 0,
        minQuantity: data.min_quantity || 0,
        unit: data.unit || 'unidade',
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        cost: data.cost || 0,
        supplier: data.supplier || '',
        location: data.location || '',
      };
    } catch (error) {
      console.error('❌ Erro no serviço de atualização de item do estoque:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Deletando item do estoque:', id);
      
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        handleSupabaseError(error, 'deletar item do estoque');
      }
      
      console.log('✅ Item deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de item do estoque:', error);
      throw error;
    }
  },
};

// Expenses Service
export const expensesService = {
  async getAll(): Promise<Expense[]> {
    try {
      console.log('💰 Buscando gastos...');
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, 'buscar gastos');
      }
      
      console.log(`✅ ${data?.length || 0} gastos encontrados`);
      return (data || []).map(expense => ({
        id: expense.id,
        appointmentId: expense.appointment_id || '',
        description: expense.description,
        amount: expense.amount || 0,
        date: new Date(expense.date),
        category: expense.category,
        receipt: expense.receipt || '',
      }));
    } catch (error) {
      console.error('❌ Erro no serviço de gastos:', error);
      throw error;
    }
  },

  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
    try {
      console.log('➕ Criando gasto');
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          appointment_id: expense.appointmentId || null,
          description: expense.description,
          amount: expense.amount || 0,
          date: expense.date.toISOString(),
          category: expense.category,
          receipt: expense.receipt || null,
        })
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'criar gasto');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após criação do gasto');
      }
      
      console.log('✅ Gasto criado com sucesso:', data.id);
      return {
        id: data.id,
        appointmentId: data.appointment_id || '',
        description: data.description,
        amount: data.amount || 0,
        date: new Date(data.date),
        category: data.category,
        receipt: data.receipt || '',
      };
    } catch (error) {
      console.error('❌ Erro no serviço de criação de gasto:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      console.log('✏️ Atualizando gasto:', id);
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.appointmentId !== undefined) updateData.appointment_id = updates.appointmentId || null;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString();
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.receipt !== undefined) updateData.receipt = updates.receipt;
      
      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'atualizar gasto');
      }
      
      if (!data) {
        throw new Error('Gasto não encontrado para atualização');
      }
      
      console.log('✅ Gasto atualizado com sucesso');
      return {
        id: data.id,
        appointmentId: data.appointment_id || '',
        description: data.description,
        amount: data.amount || 0,
        date: new Date(data.date),
        category: data.category,
        receipt: data.receipt || '',
      };
    } catch (error) {
      console.error('❌ Erro no serviço de atualização de gasto:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Deletando gasto:', id);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        handleSupabaseError(error, 'deletar gasto');
      }
      
      console.log('✅ Gasto deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de gasto:', error);
      throw error;
    }
  },
};