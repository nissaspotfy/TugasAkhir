import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import api from '../../lib/api';

export function TableRow({ id, menu, total, status, date }) {
    return (
       <tr className="hover:bg-secondary/10 transition-colors">
          <td className="p-4 font-bold text-primary">{id}</td>
          <td className="p-4 text-foreground">{menu}</td>
          <td className="p-4 font-bold">{total}</td>
          <td className="p-4">
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'paid' ? 'bg-green-100 text-green-700' : 
                status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
             }`}>
                {status}
             </span>
          </td>
          <td className="p-4 text-muted-foreground text-sm">{date}</td>
       </tr>
    )
}

export function RecentActivity() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/transactions/my-transactions');
                setTransactions(res.data.data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) return <div>Loading transactions...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-2xl text-foreground">Pesanan Terakhir</h3>
                {/* <Button variant="ghost" className="text-primary hover:text-primary/80">Lihat Semua</Button> */}
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50">
                        <tr>
                            <th className="p-4 font-bold">ID Pesanan</th>
                            <th className="p-4 font-bold">Menu</th>
                            <th className="p-4 font-bold">Total</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-muted-foreground">Belum ada transaksi</td>
                            </tr>
                        ) : (
                            transactions.map((t) => {
                                const menu = t.items.map(i => `${i.product.name} x${i.quantity}`).join(', ');
                                const date = new Date(t.createdAt).toLocaleDateString('id-ID');
                                return (
                                    <TableRow 
                                        key={t.id}
                                        id={`#ORD-${t.id}`}
                                        menu={menu}
                                        total={`Rp ${t.total_amount.toLocaleString()}`}
                                        status={t.status}
                                        date={date}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    )
}