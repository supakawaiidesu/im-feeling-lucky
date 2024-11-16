
import { useEffect, useState } from 'react'

interface StatsData {
    price: number
    apy: number
}

export function useMoltenStats() {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const [priceRes, apyRes] = await Promise.all([
                fetch('https://coins.llama.fi/prices/current/arbitrum:0x66E535e8D2ebf13F49F3D49e5c50395a97C137b1'),
                fetch('https://yields.llama.fi/poolsEnriched?pool=26dc1672-d5b3-4461-9220-0fa3d457bc76')
            ])

            const priceData = await priceRes.json()
            const apyData = await apyRes.json()

            setStats({
                price: priceData.coins['arbitrum:0x66E535e8D2ebf13F49F3D49e5c50395a97C137b1'].price,
                apy: apyData.data[0].apyMean30d
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    return { stats, isLoading }
}