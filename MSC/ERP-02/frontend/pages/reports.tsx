import FinancialDashboard from '../components/FinancialDashboard'
import GPReport from '../components/GPReport'
import StockMovementReport from '../components/StockMovementReport'
import AgingArReport from '../components/AgingArReport'
import ProductSalesRanking from '../components/ProductSalesRanking'

export default function Reports() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>
      <FinancialDashboard />
      <div className="mt-6 grid grid-cols-1 gap-4">
        <GPReport />
        <ProductSalesRanking />
        <StockMovementReport />
        <AgingArReport />
      </div>
    </div>
  )
}
