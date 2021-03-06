#include <linux/module.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

MODULE_INFO(vermagic, VERMAGIC_STRING);

__visible struct module __this_module
__attribute__((section(".gnu.linkonce.this_module"))) = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

static const struct modversion_info ____versions[]
__used
__attribute__((section("__versions"))) = {
	{ 0xc6c01fa, __VMLINUX_SYMBOL_STR(module_layout) },
	{ 0xe688aa9, __VMLINUX_SYMBOL_STR(register_netdevice) },
	{ 0xf699984e, __VMLINUX_SYMBOL_STR(kobject_put) },
	{ 0x3356b90b, __VMLINUX_SYMBOL_STR(cpu_tss) },
	{ 0x92a94ad2, __VMLINUX_SYMBOL_STR(kmalloc_caches) },
	{ 0x9c9075e5, __VMLINUX_SYMBOL_STR(kobject_get) },
	{ 0xd2b09ce5, __VMLINUX_SYMBOL_STR(__kmalloc) },
	{ 0xd3212239, __VMLINUX_SYMBOL_STR(skb_seq_read) },
	{ 0x580b6e8f, __VMLINUX_SYMBOL_STR(debugfs_create_dir) },
	{ 0x349cba85, __VMLINUX_SYMBOL_STR(strchr) },
	{ 0x8574f4e9, __VMLINUX_SYMBOL_STR(single_open) },
	{ 0x32b61a2, __VMLINUX_SYMBOL_STR(skb_split) },
	{ 0x754d539c, __VMLINUX_SYMBOL_STR(strlen) },
	{ 0x60a13e90, __VMLINUX_SYMBOL_STR(rcu_barrier) },
	{ 0x43a53735, __VMLINUX_SYMBOL_STR(__alloc_workqueue_key) },
	{ 0x19f462ab, __VMLINUX_SYMBOL_STR(kfree_call_rcu) },
	{ 0x79aa04a2, __VMLINUX_SYMBOL_STR(get_random_bytes) },
	{ 0x98ac23a8, __VMLINUX_SYMBOL_STR(single_release) },
	{ 0x5624fead, __VMLINUX_SYMBOL_STR(seq_puts) },
	{ 0xc7a4fbed, __VMLINUX_SYMBOL_STR(rtnl_lock) },
	{ 0xe3ff9b8d, __VMLINUX_SYMBOL_STR(no_llseek) },
	{ 0xd9d3bcd3, __VMLINUX_SYMBOL_STR(_raw_spin_lock_bh) },
	{ 0x33622370, __VMLINUX_SYMBOL_STR(skb_clone) },
	{ 0x923438e2, __VMLINUX_SYMBOL_STR(dev_get_by_name) },
	{ 0x9803591e, __VMLINUX_SYMBOL_STR(skb_copy) },
	{ 0xc0a3d105, __VMLINUX_SYMBOL_STR(find_next_bit) },
	{ 0x6b06fdce, __VMLINUX_SYMBOL_STR(delayed_work_timer_fn) },
	{ 0x56d4ca56, __VMLINUX_SYMBOL_STR(seq_printf) },
	{ 0xd2da1048, __VMLINUX_SYMBOL_STR(register_netdevice_notifier) },
	{ 0xd9af5643, __VMLINUX_SYMBOL_STR(netdev_master_upper_dev_get) },
	{ 0x44b1d426, __VMLINUX_SYMBOL_STR(__dynamic_pr_debug) },
	{ 0x490c048a, __VMLINUX_SYMBOL_STR(netdev_master_upper_dev_get_rcu) },
	{ 0x949f7342, __VMLINUX_SYMBOL_STR(__alloc_percpu) },
	{ 0xd042917d, __VMLINUX_SYMBOL_STR(__dev_kfree_skb_any) },
	{ 0x9580deb, __VMLINUX_SYMBOL_STR(init_timer_key) },
	{ 0xa57863e, __VMLINUX_SYMBOL_STR(cancel_delayed_work_sync) },
	{ 0x46d968ef, __VMLINUX_SYMBOL_STR(debugfs_create_file) },
	{ 0x27000b29, __VMLINUX_SYMBOL_STR(crc32c) },
	{ 0x91715312, __VMLINUX_SYMBOL_STR(sprintf) },
	{ 0x6cc6b59b, __VMLINUX_SYMBOL_STR(debugfs_remove_recursive) },
	{ 0x57793513, __VMLINUX_SYMBOL_STR(seq_read) },
	{ 0xeb9d0432, __VMLINUX_SYMBOL_STR(nonseekable_open) },
	{ 0x7d11c268, __VMLINUX_SYMBOL_STR(jiffies) },
	{ 0xc9ec4e21, __VMLINUX_SYMBOL_STR(free_percpu) },
	{ 0x9d0d6206, __VMLINUX_SYMBOL_STR(unregister_netdevice_notifier) },
	{ 0xe2d5255a, __VMLINUX_SYMBOL_STR(strcmp) },
	{ 0x9273028d, __VMLINUX_SYMBOL_STR(kobject_create_and_add) },
	{ 0x733c3b54, __VMLINUX_SYMBOL_STR(kasprintf) },
	{ 0xc6a7c647, __VMLINUX_SYMBOL_STR(netdev_master_upper_dev_link) },
	{ 0xcd262071, __VMLINUX_SYMBOL_STR(__netdev_alloc_skb) },
	{ 0x987c705e, __VMLINUX_SYMBOL_STR(netif_rx) },
	{ 0xea55fe71, __VMLINUX_SYMBOL_STR(__pskb_pull_tail) },
	{ 0x9e88526, __VMLINUX_SYMBOL_STR(__init_waitqueue_head) },
	{ 0x4f8b5ddb, __VMLINUX_SYMBOL_STR(_copy_to_user) },
	{ 0xfe7c4287, __VMLINUX_SYMBOL_STR(nr_cpu_ids) },
	{ 0x3c80c06c, __VMLINUX_SYMBOL_STR(kstrtoull) },
	{ 0x37befc70, __VMLINUX_SYMBOL_STR(jiffies_to_msecs) },
	{ 0xe63ef7b2, __VMLINUX_SYMBOL_STR(arp_create) },
	{ 0x27e1a049, __VMLINUX_SYMBOL_STR(printk) },
	{ 0xfa3e88d2, __VMLINUX_SYMBOL_STR(skb_prepare_seq_read) },
	{ 0x449ad0a7, __VMLINUX_SYMBOL_STR(memcmp) },
	{ 0x11ec5e3, __VMLINUX_SYMBOL_STR(free_netdev) },
	{ 0xa1c76e0a, __VMLINUX_SYMBOL_STR(_cond_resched) },
	{ 0xa4511467, __VMLINUX_SYMBOL_STR(crc16) },
	{ 0x887e43d7, __VMLINUX_SYMBOL_STR(netdev_upper_dev_unlink) },
	{ 0x5a921311, __VMLINUX_SYMBOL_STR(strncmp) },
	{ 0x5792f848, __VMLINUX_SYMBOL_STR(strlcpy) },
	{ 0x16305289, __VMLINUX_SYMBOL_STR(warn_slowpath_null) },
	{ 0xb7964e0, __VMLINUX_SYMBOL_STR(skb_push) },
	{ 0x8c03d20c, __VMLINUX_SYMBOL_STR(destroy_workqueue) },
	{ 0xda805034, __VMLINUX_SYMBOL_STR(dev_get_by_index) },
	{ 0x1aef3755, __VMLINUX_SYMBOL_STR(dev_remove_pack) },
	{ 0xa735db59, __VMLINUX_SYMBOL_STR(prandom_u32) },
	{ 0xb5277b74, __VMLINUX_SYMBOL_STR(init_net) },
	{ 0x7215f146, __VMLINUX_SYMBOL_STR(rtnl_link_unregister) },
	{ 0xc521c933, __VMLINUX_SYMBOL_STR(__dev_get_by_index) },
	{ 0x42160169, __VMLINUX_SYMBOL_STR(flush_workqueue) },
	{ 0x36a9ae86, __VMLINUX_SYMBOL_STR(kobject_uevent_env) },
	{ 0x9f46ced8, __VMLINUX_SYMBOL_STR(__sw_hweight64) },
	{ 0x74d0eec8, __VMLINUX_SYMBOL_STR(module_put) },
	{ 0xa7233ac8, __VMLINUX_SYMBOL_STR(sysfs_remove_file_ns) },
	{ 0xbba70a2d, __VMLINUX_SYMBOL_STR(_raw_spin_unlock_bh) },
	{ 0x70cd1f, __VMLINUX_SYMBOL_STR(queue_delayed_work_on) },
	{ 0xdb7305a1, __VMLINUX_SYMBOL_STR(__stack_chk_fail) },
	{ 0xb9249d16, __VMLINUX_SYMBOL_STR(cpu_possible_mask) },
	{ 0x1000e51, __VMLINUX_SYMBOL_STR(schedule) },
	{ 0x4bc955f4, __VMLINUX_SYMBOL_STR(kfree_skb) },
	{ 0x96b29254, __VMLINUX_SYMBOL_STR(strncasecmp) },
	{ 0x6b2dc060, __VMLINUX_SYMBOL_STR(dump_stack) },
	{ 0x8c961247, __VMLINUX_SYMBOL_STR(alloc_netdev_mqs) },
	{ 0x17cf49e, __VMLINUX_SYMBOL_STR(eth_type_trans) },
	{ 0x38bd55bd, __VMLINUX_SYMBOL_STR(pskb_expand_head) },
	{ 0xec225ef3, __VMLINUX_SYMBOL_STR(param_set_copystring) },
	{ 0xbdfb6dbb, __VMLINUX_SYMBOL_STR(__fentry__) },
	{ 0x90339ca9, __VMLINUX_SYMBOL_STR(ether_setup) },
	{ 0xfcb67e5b, __VMLINUX_SYMBOL_STR(__pskb_copy_fclone) },
	{ 0x81fcd7c8, __VMLINUX_SYMBOL_STR(kmem_cache_alloc_trace) },
	{ 0x3928efe9, __VMLINUX_SYMBOL_STR(__per_cpu_offset) },
	{ 0x2a18c74, __VMLINUX_SYMBOL_STR(nf_conntrack_destroy) },
	{ 0x1cd5ae90, __VMLINUX_SYMBOL_STR(skb_pull_rcsum) },
	{ 0xb9268c3a, __VMLINUX_SYMBOL_STR(unregister_netdevice_queue) },
	{ 0xa6bbd805, __VMLINUX_SYMBOL_STR(__wake_up) },
	{ 0xf6ebc03b, __VMLINUX_SYMBOL_STR(net_ratelimit) },
	{ 0x2207a57f, __VMLINUX_SYMBOL_STR(prepare_to_wait_event) },
	{ 0x859b7eea, __VMLINUX_SYMBOL_STR(eth_validate_addr) },
	{ 0x1e047854, __VMLINUX_SYMBOL_STR(warn_slowpath_fmt) },
	{ 0x9e2b878e, __VMLINUX_SYMBOL_STR(seq_lseek) },
	{ 0x37a0cba, __VMLINUX_SYMBOL_STR(kfree) },
	{ 0x69ad2f20, __VMLINUX_SYMBOL_STR(kstrtouint) },
	{ 0x3991897, __VMLINUX_SYMBOL_STR(dev_get_iflink) },
	{ 0x69acdf38, __VMLINUX_SYMBOL_STR(memcpy) },
	{ 0x643e0ce5, __VMLINUX_SYMBOL_STR(call_rcu_sched) },
	{ 0x208305a4, __VMLINUX_SYMBOL_STR(rtnl_link_register) },
	{ 0xf08242c2, __VMLINUX_SYMBOL_STR(finish_wait) },
	{ 0x7cbab064, __VMLINUX_SYMBOL_STR(unregister_netdev) },
	{ 0x2e0d2f7f, __VMLINUX_SYMBOL_STR(queue_work_on) },
	{ 0x1582eadf, __VMLINUX_SYMBOL_STR(dev_add_pack) },
	{ 0xfcdd074, __VMLINUX_SYMBOL_STR(param_get_string) },
	{ 0xb0e602eb, __VMLINUX_SYMBOL_STR(memmove) },
	{ 0x420ffece, __VMLINUX_SYMBOL_STR(consume_skb) },
	{ 0x85670f1d, __VMLINUX_SYMBOL_STR(rtnl_is_locked) },
	{ 0x7f02188f, __VMLINUX_SYMBOL_STR(__msecs_to_jiffies) },
	{ 0xf16343f3, __VMLINUX_SYMBOL_STR(sysfs_create_file_ns) },
	{ 0x7e58b7db, __VMLINUX_SYMBOL_STR(dev_queue_xmit) },
	{ 0x64a71dc1, __VMLINUX_SYMBOL_STR(skb_put) },
	{ 0x4f6b400b, __VMLINUX_SYMBOL_STR(_copy_from_user) },
	{ 0xfa1f8287, __VMLINUX_SYMBOL_STR(skb_copy_bits) },
	{ 0x6e720ff2, __VMLINUX_SYMBOL_STR(rtnl_unlock) },
	{ 0x716d3da4, __VMLINUX_SYMBOL_STR(try_module_get) },
};

static const char __module_depends[]
__used
__attribute__((section(".modinfo"))) =
"depends=libcrc32c";


MODULE_INFO(srcversion, "EB0DD14FF86D02C9010C80B");
