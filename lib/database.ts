import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  sale_price: number | null
  stock: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  price_paid: number
  purchase_date: string
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  type: string
  status: string
  condition: string
  discount: string
  product_id: string | null
  start_date: string
  end_date: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CallTrigger {
  id: string
  campaign_id: string
  customer_id: string
  product_id: string
  trigger_type: string
  discount_percent: number | null
  new_price: number | null
  original_price: number | null
  status: string
  scheduled_at: string
  created_at: string
}

// Database functions
export const db = {
  // Customer functions
  customers: {
    async getAll() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Customer>) {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Product functions
  products: {
    async getAll() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Product>) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Purchase functions
  purchases: {
    async getAll() {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          customer:customers(*),
          product:products(*)
        `)
        .order('purchase_date', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getByCustomer(customerId: string) {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          product:products(*)
        `)
        .eq('customer_id', customerId)
        .order('purchase_date', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getByProduct(productId: string) {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('product_id', productId)
        .order('purchase_date', { ascending: false })
      
      if (error) throw error
      return data
    },

    async create(purchase: Omit<Purchase, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('purchases')
        .insert(purchase)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Campaign functions
  campaigns: {
    async getAll() {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          product:products(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          product:products(*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async create(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Campaign>) {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Call trigger functions
  callTriggers: {
    async getAll() {
      const { data, error } = await supabase
        .from('call_triggers')
        .select(`
          *,
          campaign:campaigns(*),
          customer:customers(*),
          product:products(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async create(callTrigger: Omit<CallTrigger, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('call_triggers')
        .insert(callTrigger)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async updateStatus(id: string, status: string) {
      const { data, error } = await supabase
        .from('call_triggers')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}