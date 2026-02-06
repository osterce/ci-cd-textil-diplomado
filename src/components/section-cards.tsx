import { IconArchive, IconArchiveOff, IconFolderCheck, IconFolderDown, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <IconArchive className="size-12"/>
          <CardDescription>Total Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            542
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tendencia este mes<IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total Items en inventario
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-green-100 text-green-700">
            <IconFolderCheck className="size-12" />
          </div>
          <CardDescription>Disponibles</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-500">
            521
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bajo 20% en este mes <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Cantidad de items disponibles
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-yellow-100 text-yellow-700">
            <IconFolderDown className="size-12" />
          </div>
          <CardDescription>Bajo Stock</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-yellow-500">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2.8%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tendencia en este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Número de items con bajo stock</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-red-100 text-red-700">
            <IconArchiveOff className="size-12" />
          </div>
          <CardDescription>Agotado</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-500">
            21
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +1.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tendencia en este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Cantidad de items fuera de stock</div>
        </CardFooter>
      </Card>
    </div>
  )
}
