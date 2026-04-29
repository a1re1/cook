"use client";

import { useAuth as useAuthKit } from "@workos-inc/authkit-nextjs/components";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useAuth() {
  const { user, loading: isLoading } = useAuthKit();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (user && !isLoading) {
      // Sync user to Convex
      getOrCreateUser({
        workosId: user.id,
        email: user.email,
        name: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email.split('@')[0],
        avatarUrl: user.profilePictureUrl ?? undefined,
      });
    }
  }, [user, isLoading, getOrCreateUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
