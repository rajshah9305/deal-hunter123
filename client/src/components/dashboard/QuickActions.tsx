import { motion } from "framer-motion";
import { PlusIcon, FolderPlusIcon, FileBarChart2Icon, SettingsIcon } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      id: 1,
      name: "Add New Deal",
      icon: <PlusIcon className="h-5 w-5 mr-3" />
    },
    {
      id: 2,
      name: "Create Inventory Group",
      icon: <FolderPlusIcon className="h-5 w-5 mr-3" />
    },
    {
      id: 3,
      name: "Generate Report",
      icon: <FileBarChart2Icon className="h-5 w-5 mr-3" />
    },
    {
      id: 4,
      name: "Configure AI Settings",
      icon: <SettingsIcon className="h-5 w-5 mr-3" />
    }
  ];

  return (
    <motion.div 
      className="bg-[#1C1C28] rounded-xl shadow-md p-6 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 className="text-lg font-display font-bold mb-4">Quick Actions</h2>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.button 
            key={action.id}
            className="w-full flex items-center p-3 bg-[#2D2D3A] rounded-lg hover:bg-[#FFB800] hover:text-[#1C1C28] transition-all"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
          >
            {action.icon}
            <span>{action.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
