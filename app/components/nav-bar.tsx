import { Link } from "@remix-run/react"
import { BarChart2 as ChartIcon, Home as HomeIcon, Settings2 as SettingsIcon } from "lucide-react"
import { Button } from "~/components/ui/button"

const NAV_ITEMS = [
  {
    Icon: HomeIcon,
    text: "Home",
    route: "/home"
  },
  {
    Icon: ChartIcon,
    text: "Charts",
    route: "/charts"
  },
  {
    Icon: SettingsIcon,
    text: "Preferences",
    route: "/preferences"
  }
]

export const NavBar = () => {
  return (
    <nav className="fixed h-20 px-2 py-4 inset-x-0 bottom-0 bg-background border-t">
      <ul className="w-full grid grid-cols-3 gap-0.5">
        {NAV_ITEMS.map(({ text, route, Icon }) => (
          <li key={text} className="inline-flex justify-center items-center">
            <Button variant="ghost" size="lg" className="w-full flex-col h-12 py-1" asChild>
              <Link to={route}>
                <Icon className="w-6 h-6" />
                <span className="text-xs">{text}</span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
