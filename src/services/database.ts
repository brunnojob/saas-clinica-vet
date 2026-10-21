import { supabase } from '../lib/supabase';
import { Animal, Appointment, Expense, InventoryItem, User } from '../types';

const handleSupabaseError = (
  error: { code?: string; message?: string },
  operation: string,
) => {
  if (error.code === '42501') {
    throw new Error(
      'Erro de permissão no banco de dados. Verifique as configurações de segurança.',
    );
  }

  if (error.code === 'PGRST116') {
    throw new Error('Nenhum registro encontrado.');
  }

  throw new Error(error.message || `Erro na operação ${operation}`);
};

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar, created_at, auth_user_id')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'buscar usuários');
    }

    return (data || []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authUserId: user.auth_user_id ?? undefined,
      createdAt: new Date(user.created_at),
    }));
  },

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        auth_user_id: user.authUserId || null,
      })
      .select('id, name, email, role, avatar, created_at, auth_user_id')
      .single();

    if (error) {
      handleSupabaseError(error, 'criar usuário');
    }

    if (!data) {
      throw new Error('Nenhum dado retornado após criação do usuário');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      authUserId: data.auth_user_id ?? undefined,
      createdAt: new Date(data.created_at),
    };
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const updateData: Record<string, unknown> = {
      name: updates.name,
      email: updates.email,
      role: updates.role,
      avatar: updates.avatar,
      auth_user_id:
        updates.authUserId === undefined
          ? undefined
          : updates.authUserId || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, avatar, created_at, auth_user_id')
      .single();

    if (error) {
      handleSupabaseError(error, 'atualizar usuário');
    }

    if (!data) {
      throw new Error('Usuário não encontrado para atualização');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      authUserId: data.auth_user_id ?? undefined,
      createdAt: new Date(data.created_at),
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deletar usuário');
    }
  },
};

export const animalsService = {
  async getAll(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'buscar animais');
    }

    return (data || []).map((animal) => ({
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
  },

  async create(
    animal: Omit<Animal, 'id' | 'createdAt' | 'ownerId'>,
  ): Promise<Animal> {
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
  },

  async update(id: string, updates: Partial<Animal>): Promise<Animal> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.species !== undefined) updateData.species = updates.species;
    if (updates.registrationNumber !== undefined)
      updateData.registration_number = updates.registrationNumber;
    if (updates.age !== undefined) updateData.age = updates.age;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    if (updates.owner) {
      if (updates.owner.name !== undefined)
        updateData.owner_name = updates.owner.name;
      if (updates.owner.phone !== undefined)
        updateData.owner_phone = updates.owner.phone;
      if (updates.owner.email !== undefined)
        updateData.owner_email = updates.owner.email;
      if (updates.owner.address !== undefined)
        updateData.owner_address = updates.owner.address;
      if (updates.owner.cpf !== undefined)
        updateData.owner_cpf = updates.owner.cpf;
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
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('animals').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deletar animal');
    }
  },
};

export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'buscar atendimentos');
    }

    return (data || []).map((appointment) => ({
      id: appointment.id,
      medicalRecordId: appointment.animal_id,
      date: new Date(appointment.date),
      type: appointment.type,
      description: appointment.description,
      diagnosis: appointment.diagnosis,
      treatment: appointment.treatment,
      medications: appointment.medications || [],
      nextAppointment: appointment.next_appointment
        ? new Date(appointment.next_appointment)
        : undefined,
      veterinarianId: appointment.veterinarian_id,
      cost: appointment.cost || 0,
    }));
  },

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
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

    return {
      id: data.id,
      medicalRecordId: data.animal_id,
      date: new Date(data.date),
      type: data.type,
      description: data.description,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      medications: data.medications || [],
      nextAppointment: data.next_appointment
        ? new Date(data.next_appointment)
        : undefined,
      veterinarianId: data.veterinarian_id,
      cost: data.cost || 0,
    };
  },

  async update(
    id: string,
    updates: Partial<Appointment>,
  ): Promise<Appointment> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.medicalRecordId !== undefined)
      updateData.animal_id = updates.medicalRecordId;
    if (updates.veterinarianId !== undefined)
      updateData.veterinarian_id = updates.veterinarianId;
    if (updates.date !== undefined)
      updateData.date = updates.date.toISOString();
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.diagnosis !== undefined)
      updateData.diagnosis = updates.diagnosis;
    if (updates.treatment !== undefined)
      updateData.treatment = updates.treatment;
    if (updates.medications !== undefined)
      updateData.medications = updates.medications;
    if (updates.nextAppointment !== undefined)
      updateData.next_appointment = updates.nextAppointment?.toISOString();
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

    return {
      id: data.id,
      medicalRecordId: data.animal_id,
      date: new Date(data.date),
      type: data.type,
      description: data.description,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      medications: data.medications || [],
      nextAppointment: data.next_appointment
        ? new Date(data.next_appointment)
        : undefined,
      veterinarianId: data.veterinarian_id,
      cost: data.cost || 0,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deletar atendimento');
    }
  },
};

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'buscar itens do estoque');
    }

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category || '',
      quantity: item.quantity || 0,
      minQuantity: item.min_quantity || 0,
      unit: item.unit || 'unidade',
      expirationDate: item.expiration_date
        ? new Date(item.expiration_date)
        : undefined,
      cost: item.cost || 0,
      supplier: item.supplier || '',
      location: item.location || '',
    }));
  },

  async create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name: item.name,
        type: item.type,
        category: item.category || '',
        quantity: item.quantity || 0,
        min_quantity: item.minQuantity || 0,
        unit: item.unit || 'unidade',
        expiration_date:
          item.expirationDate?.toISOString().split('T')[0] || null,
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

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      category: data.category || '',
      quantity: data.quantity || 0,
      minQuantity: data.min_quantity || 0,
      unit: data.unit || 'unidade',
      expirationDate: data.expiration_date
        ? new Date(data.expiration_date)
        : undefined,
      cost: data.cost || 0,
      supplier: data.supplier || '',
      location: data.location || '',
    };
  },

  async update(
    id: string,
    updates: Partial<InventoryItem>,
  ): Promise<InventoryItem> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.minQuantity !== undefined)
      updateData.min_quantity = updates.minQuantity;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.expirationDate !== undefined)
      updateData.expiration_date = updates.expirationDate
        ?.toISOString()
        .split('T')[0];
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

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      category: data.category || '',
      quantity: data.quantity || 0,
      minQuantity: data.min_quantity || 0,
      unit: data.unit || 'unidade',
      expirationDate: data.expiration_date
        ? new Date(data.expiration_date)
        : undefined,
      cost: data.cost || 0,
      supplier: data.supplier || '',
      location: data.location || '',
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deletar item do estoque');
    }
  },
};

export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'buscar gastos');
    }

    return (data || []).map((expense) => ({
      id: expense.id,
      appointmentId: expense.appointment_id || '',
      description: expense.description,
      amount: expense.amount || 0,
      date: new Date(expense.date),
      category: expense.category,
      receipt: expense.receipt || '',
    }));
  },

  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
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

    return {
      id: data.id,
      appointmentId: data.appointment_id || '',
      description: data.description,
      amount: data.amount || 0,
      date: new Date(data.date),
      category: data.category,
      receipt: data.receipt || '',
    };
  },

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.appointmentId !== undefined)
      updateData.appointment_id = updates.appointmentId || null;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date !== undefined)
      updateData.date = updates.date.toISOString();
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

    return {
      id: data.id,
      appointmentId: data.appointment_id || '',
      description: data.description,
      amount: data.amount || 0,
      date: new Date(data.date),
      category: data.category,
      receipt: data.receipt || '',
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deletar gasto');
    }
  },
};
