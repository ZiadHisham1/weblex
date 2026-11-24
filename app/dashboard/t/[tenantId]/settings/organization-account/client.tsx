// app/dashboard/t/[tenantId]/settings/organization-account/client.tsx
"use client";

import { Organization, OrganizationMember, User } from "@prisma/client";
import { Ban } from "lucide-react";

// Type to match our Prisma query
type MemberWithUser = OrganizationMember & {
  user: User;
};

type OrganizationWithMembers = Organization & {
  members: MemberWithUser[];
};

export default function UsersClient({ org }: { org: OrganizationWithMembers }) {
  return (
    <div className="no-scrollbar">  
    {/* Top Bar Actions */}
    <div className="flex items-center justify-end gap-2 mb-10">
    <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
        Export
    </button>
    <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
        Import
    </button>
    <button className="px-4 py-1.5 text-sm font-medium text-white bg-black rounded-full shadow-sm hover:bg-gray-800 transition-colors">
        Add users
    </button>
    </div>

    <div className="mx-auto w-full max-w-[850px] h-full px-4 md:px-8">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Users</h1>

      {/* Users Table Card */}
      <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
        
        {/* Table Header */}
        <div className="p-2">
          <div className="grid grid-cols-12 py-1 bg-gray-100 rounded-lg  text-sm font-medium text-gray-500">
            <div className="col-span-1 flex items-center justify-center">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
            </div>
            <div className="col-span-2">User</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Role</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {org.members.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No users found for this organization.
            </div>
          ) : (
            org.members.map((member) => (
              <div 
                key={member.id} 
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-[#FAFAFA] hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center justify-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
                </div>

                {/* User Info */}
                <div className="col-span-5 flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {member.user.name || "Unnamed User"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {member.user.email}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-3">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-[#D1F5B8] text-green-800">
                    Active
                  </span>
                </div>

                {/* Role */}
                <div className="col-span-3 flex items-center gap-2 text-sm text-gray-700">
                  <Ban className="w-4 h-4 text-red-500" />
                  <span>
                    {/* Format OrgRole (e.g., OWNER becomes Organization owner) */}
                    Organization {member.role.toLowerCase()}, Store owner
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
    </div>
  );
}