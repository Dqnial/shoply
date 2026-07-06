"use client";

import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  ShieldAlert,
  Trash2,
  Banknote,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types";

export default function UsersTable({
  users,
  onTopUpRequest,
  onRoleRequest,
  onDeleteRequest,
}: {
  users: User[];
  onTopUpRequest: (user: User) => void;
  onRoleRequest: (user: User) => void;
  onDeleteRequest: (user: User) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-muted-foreground/10">
            <TableHead className="h-14 px-6 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Клиент
            </TableHead>
            <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Баланс
            </TableHead>
            <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Роль
            </TableHead>
            <TableHead className="h-14 px-6 text-right font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Действие
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              className="border-b border-muted-foreground/10 last:border-0 hover:bg-muted/5 transition-colors"
            >
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xs overflow-hidden relative ${
                      !(
                        user.image &&
                        !user.image.includes("default-avatar.png")
                      )
                        ? "bg-primary shadow-lg shadow-primary/20"
                        : ""
                    }`}
                  >
                    {user.image &&
                    !user.image.includes("default-avatar.png") ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        fill
                        className="object-cover rounded-xl"
                        unoptimized
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-foreground">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-bold text-sm text-foreground">
                  {user.balance?.toLocaleString()} ₸
                </span>
              </TableCell>
              <TableCell>
                {user.isAdmin ? (
                  <Badge className="rounded-lg bg-primary text-primary-foreground border-none px-2 py-0.5 font-bold text-[10px]">
                    ADMIN
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="rounded-lg text-muted-foreground border-muted-foreground/20 px-2 py-0.5 font-bold text-[10px]"
                  >
                    USER
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer rounded-xl h-8 w-8 hover:bg-muted"
                    >
                      <MoreHorizontal
                        size={18}
                        className="text-muted-foreground"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl w-52 p-1.5 border-muted-foreground/10 shadow-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => onTopUpRequest(user)}
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm"
                    >
                      <Banknote className="mr-2 h-4 w-4 text-muted-foreground" />
                      Пополнить баланс
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRoleRequest(user)}
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm"
                    >
                      <ShieldAlert className="mr-2 h-4 w-4 text-muted-foreground" />
                      Изменить роль
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 opacity-50" />
                    <DropdownMenuItem
                      disabled={user.isAdmin}
                      onClick={() => onDeleteRequest(user)}
                      className="cursor-pointer rounded-lg p-2.5 text-destructive focus:text-destructive focus:bg-destructive/5 font-medium text-sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить аккаунт
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
