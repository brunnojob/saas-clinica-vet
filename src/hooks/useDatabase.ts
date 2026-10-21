import { useEffect, useState } from 'react';
import {
  animalsService,
  appointmentsService,
  expensesService,
  inventoryService,
  usersService,
} from '../services/database';
import { Animal, Appointment, Expense, InventoryItem, User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar usuários',
      );
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const newUser = await usersService.create(user);
      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await usersService.update(id, updates);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user)),
      );
      return updatedUser;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar usuário',
      );
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersService.delete(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await animalsService.getAll();
      setAnimals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  };

  const createAnimal = async (
    animal: Omit<Animal, 'id' | 'createdAt' | 'ownerId'>,
  ) => {
    try {
      const newAnimal = await animalsService.create(animal);
      setAnimals((prev) => [newAnimal, ...prev]);
      return newAnimal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar animal');
      throw err;
    }
  };

  const updateAnimal = async (id: string, updates: Partial<Animal>) => {
    try {
      const updatedAnimal = await animalsService.update(id, updates);
      setAnimals((prev) =>
        prev.map((animal) => (animal.id === id ? updatedAnimal : animal)),
      );
      return updatedAnimal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar animal');
      throw err;
    }
  };

  const deleteAnimal = async (id: string) => {
    try {
      await animalsService.delete(id);
      setAnimals((prev) => prev.filter((animal) => animal.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir animal');
      throw err;
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  return {
    animals,
    loading,
    error,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    refetch: fetchAnimals,
  };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar atendimentos',
      );
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await appointmentsService.create(appointment);
      setAppointments((prev) => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar atendimento',
      );
      throw err;
    }
  };

  const updateAppointment = async (
    id: string,
    updates: Partial<Appointment>,
  ) => {
    try {
      const updatedAppointment = await appointmentsService.update(id, updates);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment,
        ),
      );
      return updatedAppointment;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar atendimento',
      );
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentsService.delete(id);
      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao excluir atendimento',
      );
      throw err;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = await inventoryService.create(item);
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar item');
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = await inventoryService.update(id, updates);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item)),
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await inventoryService.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item');
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expensesService.getAll();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar gastos');
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await expensesService.create(expense);
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar gasto');
      throw err;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const updatedExpense = await expensesService.update(id, updates);
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? updatedExpense : expense)),
      );
      return updatedExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar gasto');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expensesService.delete(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir gasto');
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
