import React, { useRef, useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
	{ name: "Jan", balance: 200 },
	{ name: "Feb", balance: 350 },
	{ name: "Mar", balance: 500 },
	{ name: "Apr", balance: 750 },
	{ name: "May", balance: 900 },
	{ name: "Jun", balance: 1200 },
];

export default function Dashboard(props) {
	// canvas for blinking stars (login-like)
	const canvasRef = useRef(null);

	// refs for button indicator animation
	const actionsRef = useRef(null);
	const btnRefs = useRef({});
	const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

	// draw blinking stars
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		let w = (canvas.width = window.innerWidth);
		let h = (canvas.height = window.innerHeight);
		const stars = Array.from({ length: 120 }).map(() => ({
			x: Math.random() * w,
			y: Math.random() * h,
			r: Math.random() * 1.4 + 0.2,
			alpha: Math.random(),
			speed: Math.random() * 0.02 + 0.003,
		}));
		let raf;
		function draw() {
			ctx.clearRect(0, 0, w, h);
			for (const s of stars) {
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
				ctx.fill();
				s.alpha += s.speed;
				if (s.alpha >= 1 || s.alpha <= 0) s.speed *= -1;
			}
			raf = requestAnimationFrame(draw);
		}
		draw();
		function onResize() {
			w = canvas.width = window.innerWidth;
			h = canvas.height = window.innerHeight;
		}
		window.addEventListener("resize", onResize);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	// selection / hover state for actions and filters
	const [selectedAction, setSelectedAction] = React.useState("Dashboard");
	const [selectedFilter, setSelectedFilter] = React.useState("Today");

	// position indicator under the selected button (must run after selectedAction is defined)
	useEffect(() => {
		const selectedKey = selectedAction || "Dashboard";
		const btn = btnRefs.current[selectedKey];
		const container = actionsRef.current;
		if (btn && container) {
			const bRect = btn.getBoundingClientRect();
			const cRect = container.getBoundingClientRect();
			setIndicator({ left: bRect.left - cRect.left, width: bRect.width, visible: true });
		} else {
			setIndicator((s) => ({ ...s, visible: false }));
		}
	}, [selectedAction]);

	// small button component with animated width fill
	function AnimButton({ label, onClick, selected, size = "md" }) {
		const base = "relative overflow-hidden rounded-xl transition-transform transform active:scale-95";
		const sizing = size === "sm" ? "py-2 text-xs" : "py-3 text-sm";
		return (
			<button
				ref={(el) => (btnRefs.current[label] = el)}
				onClick={onClick}
				className={`${base} ${sizing} flex-1 min-w-0 bg-white/6 text-center`}
				aria-pressed={selected}
				style={{ WebkitTapHighlightColor: "transparent" }}
			>
				{/* animated fill */}
				<span
					className={
						"absolute inset-0 bg-white/20 origin-left transform transition-transform duration-300 " +
						(selected ? "scale-x-100" : "scale-x-0")
					}
					style={{ pointerEvents: "none" }}
				/>
				{/* label above the fill */}
				<span className="relative z-10">{label}</span>
			</button>
		);
	}

	// sample user: replace with real user state/props/auth source
	const user = React.useMemo(() => ({ name: "Hamza Khan", email: "hamza@example.com" }), []);

	const handleLogout = () => {
		// clear auth token / session — adapt to your auth logic
		localStorage.removeItem("token");
		// optionally redirect to login or refresh
		window.location.reload();
	};

	// --- added: BalanceView and DepositView components + related state/handlers ---
	function BalanceView({ data }) {
		return (
			<div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl h-56 sm:h-72">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data}>
						<defs>
							<linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
								<stop offset="0%" stopColor="#0ea5e9" />
								<stop offset="100%" stopColor="#4ade80" />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" stroke="#888" />
						<YAxis stroke="#888" />
						<Tooltip />
						<Line type="monotone" dataKey="balance" stroke="url(#grad)" strokeWidth={4} dot={false} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		);
	}

	// --- modified DepositView: now accepts addToHistory and records deposits into history ---
	function DepositView({ addToHistory }) {
		const [amount, setAmount] = React.useState("");
		const [step, setStep] = React.useState("form"); // form -> address -> confirmed
		const [address, setAddress] = React.useState("");
		const [file, setFile] = React.useState(null);
		const [uploading, setUploading] = React.useState(false);
		const [status, setStatus] = React.useState(""); // success / error / pending

		const formatCurrency = (val) => {
			const n = Number(val);
			if (Number.isNaN(n)) return val;
			return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
		};

		function createDepositAddress() {
			// simple fake address generator (replace with server-side generation)
			return "0x" + Math.random().toString(36).slice(2, 12).toUpperCase();
		}

		const handleSubmitAmount = (e) => {
			e.preventDefault();
			if (!amount || Number(amount) <= 0) {
				setStatus("Please enter a valid amount.");
				return;
			}
			setStatus("");
			const addr = createDepositAddress();
			setAddress(addr);
			setStep("address");
		};

		const handleCopyAddress = async () => {
			try {
				await navigator.clipboard.writeText(address);
				setStatus("Address copied to clipboard.");
			} catch {
				setStatus("Copy failed. Select and copy manually.");
			}
		};

		const handleFileChange = (e) => {
			const f = e.target.files?.[0] || null;
			setFile(f);
		};

		const handleConfirm = async () => {
			if (!file) {
				setStatus("Please upload a payment screenshot before confirming.");
				return;
			}
			setUploading(true);
			setStatus("Uploading...");
			// Simulate upload
			setTimeout(() => {
				setUploading(false);
				setStep("confirmed");
				setStatus("Deposit submitted. Pending verification.");

				// Add deposit transaction to history
				try {
					if (typeof addToHistory === "function") {
						addToHistory({
							type: "deposit",
							amount: Number(amount),
							address,
							status: "pending",
							screenshotName: file?.name || null,
						});
					}
				} catch (err) {
					// non-blocking
					console.warn("addToHistory failed:", err);
				}
			}, 1400);
		};

		return (
			<div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl">
				{step === "form" && (
					<form onSubmit={handleSubmitAmount} className="flex flex-col gap-3">
						<label className="text-sm text-gray-300">Deposit Amount (USDT)</label>
						<input
							type="number"
							min="0"
							step="0.01"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="w-full rounded-xl p-3 bg-white/6 text-white placeholder-gray-400"
							placeholder="Enter amount (e.g. 100.00)"
						/>
						<div className="flex gap-2">
							<button className="flex-1 bg-white/6 rounded-xl py-3" type="submit">
								Continue
							</button>
							<button
								type="button"
								className="flex-1 bg-transparent border border-white/10 rounded-xl py-3"
								onClick={() => {
									setAmount("");
									setStatus("");
								}}
							>
								Reset
							</button>
						</div>
						{status && <div className="text-xs text-yellow-300 mt-1">{status}</div>}
					</form>
				)}

				{step === "address" && (
					<div className="flex flex-col gap-3">
						<div className="text-sm text-gray-300">Send {formatCurrency(amount)} USDT to this address:</div>

						<div className="flex items-center gap-2 bg-white/6 p-3 rounded-xl">
							<code className="break-all text-xs text-white/90">{address}</code>
							<button
								onClick={handleCopyAddress}
								className="ml-auto bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-md text-xs"
							>
								Copy
							</button>
						</div>

						<div className="flex flex-col gap-2">
							<label className="text-sm text-gray-300">Upload payment screenshot</label>
							<input type="file" accept="image/*" onChange={handleFileChange} className="text-xs file:rounded-md file:py-2 file:px-3 file:bg-white/10 file:border-0 file:text-white" />
							{file && (
								<div className="flex items-center gap-2">
									<img
										src={file ? URL.createObjectURL(file) : ""}
										alt="preview"
										className="w-20 h-20 object-cover rounded-md border border-white/10"
									/>
									<div className="text-xs text-gray-300">{file.name}</div>
								</div>
							)}
						</div>

						<div className="flex gap-2">
							<button
								onClick={handleConfirm}
								disabled={uploading}
								className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 disabled:opacity-60"
							>
								{uploading ? "Uploading..." : "Confirm"}
							</button>
							<button
								onClick={() => {
									setStep("form");
									setAddress("");
									setFile(null);
									setStatus("");
								}}
								className="flex-1 bg-transparent border border-white/10 rounded-xl py-3"
							>
								Cancel
							</button>
						</div>

						{status && <div className="text-xs text-yellow-300 mt-1">{status}</div>}
					</div>
				)}

				{step === "confirmed" && (
					<div className="flex flex-col gap-3 items-center text-center">
						<div className="text-green-400 font-medium">Deposit submitted</div>
						<div className="text-xs text-gray-300">Your payment is pending verification. We'll notify you when it's confirmed.</div>
						<div className="flex gap-2 w-full mt-2">
							<button
								className="flex-1 bg-white/6 rounded-xl py-2"
								onClick={() => {
									setStep("form");
									setAmount("");
									setAddress("");
									setFile(null);
									setStatus("");
								}}
							>
								Make another deposit
							</button>
							<button
								className="flex-1 bg-transparent border border-white/10 rounded-xl py-2"
								onClick={() => window.location.reload()}
							>
								Back to dashboard
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}
	// --- end added ---

	// helper: transaction history in localStorage
	function loadHistory() {
		try {
			const raw = localStorage.getItem("txHistory");
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}
	function saveHistory(arr) {
		try {
			localStorage.setItem("txHistory", JSON.stringify(arr));
		} catch {}
	}
	function addToHistory(entry) {
		const all = loadHistory();
		all.unshift({ id: Date.now(), date: new Date().toISOString(), ...entry });
		saveHistory(all);
	}

	// Withdraw view
	function WithdrawView({ addToHistory }) {
		const [amount, setAmount] = React.useState("");
		const [address, setAddress] = React.useState("");
		const [status, setStatus] = React.useState("");
		const [processing, setProcessing] = React.useState(false);

		const formatCurrency = (val) => {
			const n = Number(val);
			if (Number.isNaN(n)) return val;
			return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
		};

		const handleSubmit = async (e) => {
			e?.preventDefault();
			setStatus("");
			if (!amount || Number(amount) <= 0) {
				setStatus("Enter a valid amount.");
				return;
			}
			if (!address || address.length < 5) {
				setStatus("Enter a valid USDT address.");
				return;
			}

			setProcessing(true);
			setStatus("Processing withdrawal...");
			// simulate API call
			setTimeout(() => {
				setProcessing(false);
				setStatus("Withdrawal requested. It will be processed shortly.");
				// Save to history
				addToHistory({
					type: "withdraw",
					amount: Number(amount),
					address,
					status: "pending",
				});
				// Optionally reset form:
				setAmount("");
				setAddress("");
			}, 1400);
		};

		return (
			<div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl">
				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<label className="text-sm text-gray-300">Withdraw Amount (USDT)</label>
					<input
						type="number"
						min="0"
						step="0.01"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-full rounded-xl p-3 bg-white/6 text-white placeholder-gray-400"
						placeholder="Enter amount (e.g. 50.00)"
					/>

					<label className="text-sm text-gray-300">Destination USDT Address</label>
					<input
						type="text"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						className="w-full rounded-xl p-3 bg-white/6 text-white placeholder-gray-400"
						placeholder="Paste your USDT address"
					/>

					<div className="flex gap-2">
						<button
							type="submit"
							disabled={processing}
							className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 disabled:opacity-60"
						>
							{processing ? "Submitting..." : "Submit Withdrawal"}
						</button>
						<button
							type="button"
							onClick={() => { setAmount(""); setAddress(""); setStatus(""); }}
							className="flex-1 bg-transparent border border-white/10 rounded-xl py-3"
						>
							Reset
						</button>
					</div>

					{status && <div className="text-xs text-yellow-300 mt-1">{status}</div>}
					<div className="text-xs text-gray-400 mt-2">You will receive a confirmation when the withdrawal is processed.</div>
				</form>
			</div>
		);
	}

	// History view
	function HistoryView() {
		const [items, setItems] = React.useState(loadHistory());

		React.useEffect(() => {
			const onStorage = () => setItems(loadHistory());
			window.addEventListener("storage", onStorage);
			return () => window.removeEventListener("storage", onStorage);
		}, []);

		const clearAll = () => {
			if (!confirm("Clear transaction history?")) return;
			saveHistory([]);
			setItems([]);
		};

		if (!items || items.length === 0) {
			return (
				<div className="bg-neutral-900/50 backdrop-blur-xl p-4 rounded-2xl text-center text-gray-300">
					No transactions yet.
				</div>
			);
		}

		return (
			<div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl">
				<div className="flex items-center justify-between mb-2">
					<div className="text-sm font-medium">Transaction History</div>
					<button onClick={clearAll} className="text-xs text-red-400">Clear</button>
				</div>

				<div className="flex flex-col gap-2">
					{items.map((tx) => (
						<div key={tx.id} className="p-3 bg-white/5 rounded-xl flex items-start justify-between gap-3">
							<div>
								<div className="text-xs text-gray-300">{new Date(tx.date).toLocaleString()}</div>
								<div className="font-medium text-white">{tx.type?.toUpperCase() || "TX"}</div>
								<div className="text-xs text-gray-300">{formatAmount(tx.amount)}</div>
								{tx.address && <div className="text-xs text-gray-400 break-all">To: {tx.address}</div>}
							</div>
							<div className="text-right">
								<div className={tx.status === "confirmed" ? "text-green-400 text-sm" : "text-yellow-300 text-sm"}>
									{tx.status}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);

		function formatAmount(a) {
			const n = Number(a);
			if (Number.isNaN(n)) return a;
			return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
		}
	}

	// helper: reward history in localStorage
	function loadRewardHistory() {
		try {
			const raw = localStorage.getItem("rewardHistory");
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}
	function saveRewardHistory(arr) {
		try {
			localStorage.setItem("rewardHistory", JSON.stringify(arr));
		} catch {}
	}
	function addReward(entry) {
		const all = loadRewardHistory();
		all.unshift({ id: Date.now(), date: new Date().toISOString(), ...entry });
		saveRewardHistory(all);
	}

	// helper: determine initial deposit (earliest deposit in txHistory or stored value)
	function getInitialDeposit() {
		try {
			const raw = localStorage.getItem("initialDeposit");
			if (raw) return Number(raw);
			const txRaw = localStorage.getItem("txHistory");
			const txs = txRaw ? JSON.parse(txRaw) : [];
			// txHistory stored newest-first (unshift). earliest deposit is last deposit entry.
			const deposits = txs.filter((t) => t.type === "deposit" && Number(t.amount) > 0);
			if (deposits.length === 0) return 0;
			const earliest = deposits[deposits.length - 1];
			return Number(earliest.amount) || 0;
		} catch {
			return 0;
		}
	}
	function setInitialDeposit(value) {
		try {
			localStorage.setItem("initialDeposit", String(value));
		} catch {}
	}

	// Rewards view component
	function RewardView() {
		const [initial, setInitial] = React.useState(() => getInitialDeposit());
		const [dailyReward, setDailyReward] = React.useState(() => +(initial * 0.04).toFixed(2));
		const [history, setHistory] = React.useState(() => loadRewardHistory());
		const [status, setStatus] = React.useState("");

		React.useEffect(() => {
			setDailyReward(+(initial * 0.04).toFixed(2));
		}, [initial]);

		const handleCollect = () => {
			if (!initial || initial <= 0) {
				setStatus("Set your initial deposit first (or make a deposit).");
				return;
			}
			const rewardEntry = {
				amount: dailyReward,
				status: "collected",
			};
			addReward(rewardEntry);
			setHistory(loadRewardHistory());
			setStatus("Reward collected and added to reward history.");
		};

		const handleSaveInitial = (e) => {
			e?.preventDefault();
			if (!initial || Number(initial) <= 0) {
				setStatus("Enter a valid initial deposit amount.");
				return;
			}
			setInitial(Number(initial));
			setInitialDeposit(Number(initial));
			setStatus("Initial deposit saved.");
		};

		return (
			<div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl">
				<div className="flex flex-col gap-3">
					<div className="text-sm text-gray-300">Initial deposit (used to compute 4% daily reward)</div>

					<form onSubmit={handleSaveInitial} className="flex gap-2">
						<input
							type="number"
							min="0"
							step="0.01"
							value={initial || ""}
							onChange={(e) => setInitial(Number(e.target.value))}
							className="flex-1 rounded-xl p-3 bg-white/6 text-white placeholder-gray-400"
							placeholder="Enter initial deposit (USDT)"
						/>
						<button className="bg-white/6 rounded-xl py-3 px-4">Save</button>
					</form>

					<div className="bg-white/6 rounded-xl p-3 text-left">
						<div className="text-xs text-gray-300">Daily reward (4% of initial):</div>
						<div className="text-2xl font-bold mt-1">${dailyReward.toLocaleString()}</div>
						<div className="text-xs text-gray-400 mt-1">Projected monthly: ${(dailyReward * 30).toLocaleString()}</div>
					</div>

					<div className="flex gap-2">
						<button onClick={handleCollect} className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3">
							Collect Reward
						</button>
						<button
							onClick={() => {
								setInitial(0);
								setInitialDeposit(0);
								setStatus("Initial deposit cleared.");
							}}
							className="flex-1 bg-transparent border border-white/10 rounded-xl py-3"
						>
							Clear
						</button>
					</div>

					{status && <div className="text-xs text-yellow-300 mt-1">{status}</div>}

					<div className="mt-3">
						<div className="text-sm font-medium mb-2">Reward History</div>
						{history.length === 0 ? (
							<div className="text-xs text-gray-400">No rewards yet.</div>
						) : (
							<div className="flex flex-col gap-2">
								{history.map((r) => (
									<div key={r.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
										<div>
											<div className="text-xs text-gray-300">{new Date(r.date).toLocaleString()}</div>
											<div className="font-medium">${Number(r.amount).toFixed(2)}</div>
										</div>
										<div className={r.status === "collected" ? "text-green-400 text-sm" : "text-yellow-300 text-sm"}>
											{r.status}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// new: RewardTable component (shows summary + history table)
	function RewardTable() {
		const initial = getInitialDeposit();
		const daily = +(initial * 0.04).toFixed(2);
		const history = loadRewardHistory();
		const totalCollected = history.reduce((sum, h) => (h.status === "collected" ? sum + Number(h.amount) : sum), 0);

		return (
			<div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-2xl mb-4">
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-xs text-gray-400">Initial Deposit</div>
							<div className="text-lg font-semibold">${Number(initial || 0).toLocaleString()}</div>
						</div>
						<div>
							<div className="text-xs text-gray-400">Daily (4%)</div>
							<div className="text-lg font-semibold">${daily.toLocaleString()}</div>
						</div>
						<div>
							<div className="text-xs text-gray-400">Total Collected</div>
							<div className="text-lg font-semibold">${totalCollected.toFixed(2)}</div>
						</div>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Reward History</div>
						{history.length === 0 ? (
							<div className="text-xs text-gray-400">No reward transactions yet.</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead>
										<tr className="text-xs text-gray-400">
											<th className="pb-2">Date</th>
											<th className="pb-2">Amount</th>
											<th className="pb-2">Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/5">
										{history.map((r) => (
											<tr key={r.id} className="py-2">
												<td className="py-2 text-xs text-gray-300">{new Date(r.date).toLocaleString()}</td>
												<td className="py-2 font-medium">${Number(r.amount).toFixed(2)}</td>
												<td className={`py-2 text-xs ${r.status === "collected" ? "text-green-400" : "text-yellow-300"}`}>
													{r.status}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// --- replace previous conditional view area with this ---
	return (
		<div className="min-h-screen w-full bg-black text-white flex flex-col relative overflow-hidden p-4 sm:p-6 pb-24 space-y-6">
			{/* blinking stars background */}
			{/* inline styles ensure canvas is visible even if Tailwind classes aren't applied */}
			<canvas
				ref={canvasRef}
				style={{
					position: "fixed",
					inset: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					zIndex: -10,
				}}
			/>

			{/* header */}
			<div className="text-center text-lg sm:text-2xl font-bold bg-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-lg">
				GET RICH WITH HAMZA
			</div>

			{/* user banner */}
			<UserBanner user={user} onLogout={handleLogout} />

			{/* primary actions — equal width buttons in one row with sliding indicator */}
             <div ref={actionsRef} className="relative flex flex-row gap-2 mb-4 w-full">
				<AnimButton
					label="Dashboard"
					selected={selectedAction === "Dashboard"}
					onClick={() => setSelectedAction("Dashboard")}
				/>
                <AnimButton
                    label="Deposit"
                    selected={selectedAction === "Deposit"}
                    onClick={() => setSelectedAction("Deposit")}
                />
                <AnimButton
                    label="Withdraw"
                    selected={selectedAction === "Withdraw"}
                    onClick={() => setSelectedAction("Withdraw")}
                />
                <AnimButton
                    label="History"
                    selected={selectedAction === "History"}
                    onClick={() => setSelectedAction("History")}
                />
                <AnimButton
                    label="Rewards"
                    selected={selectedAction === "Rewards"}
                    onClick={() => setSelectedAction("Rewards")}
                />
				{/* sliding indicator */}
				<div
					aria-hidden
					className={`absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-green-400 transition-all duration-300 ease-out`}
					style={{
						left: indicator.left,
						width: indicator.width,
						opacity: indicator.visible ? 1 : 0,
					}}
				/>
			</div>

			{/* total balance card (added extra bottom margin) */}
			<div className="bg-neutral-900/50 backdrop-blur-xl rounded-2xl p-4 mb-6 text-center">
				<p className="text-gray-400 text-xs">Total Balance</p>
				<h1 className="text-2xl sm:text-4xl font-bold mt-2">$1,200.00</h1>
			</div>

			{/* Filters shown only on Dashboard (unchanged content but keep spacing) */}
            {selectedAction === "Dashboard" && (
                <div className="flex gap-2 mb-4">
                    <AnimButton
                        label="Today"
                        size="sm"
                        selected={selectedFilter === "Today"}
                        onClick={() => setSelectedFilter("Today")}
                    />
                    <AnimButton
                        label="This Month"
                        size="sm"
                        selected={selectedFilter === "This Month"}
                        onClick={() => setSelectedFilter("This Month")}
                    />
                    <AnimButton
                        label="Lifetime"
                        size="sm"
                        selected={selectedFilter === "Lifetime"}
                        onClick={() => setSelectedFilter("Lifetime")}
                    />
                </div>
            )}

            {/* main view area (chart / deposit / withdraw / history) with extra spacing */}
            <div className="mb-6">
                {selectedAction === "Dashboard" && (
                    <>
                        <RewardTable />
                        <BalanceView data={data} />
                    </>
                )}
                {selectedAction === "Deposit" && <DepositView addToHistory={addToHistory} />}
                {selectedAction === "Withdraw" && <WithdrawView addToHistory={addToHistory} />}
                {selectedAction === "History" && <HistoryView />}
                {selectedAction === "Rewards" && <RewardView />}
                {selectedAction !== "Dashboard" &&
                    selectedAction !== "Deposit" &&
                    selectedAction !== "Withdraw" &&
                    selectedAction !== "History" && (
                        <div className="bg-neutral-900/50 backdrop-blur-xl rounded-2xl p-4 text-center text-gray-300">
                            {selectedAction} view coming soon.
                        </div>
                    )}
            </div>

			{/* bottom spacer so last section isn't obscured by mobile browser UI */}
			<div className="h-20" />
		</div>
	);
}

// small user banner component (mobile-friendly)
function UserBanner({ user, onLogout }) {
	return (
		<div className="mt-3 bg-white/6 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="w-12 h-12 bg-gradient-to-tr from-sky-400 to-green-400 rounded-full flex items-center justify-center text-sm font-semibold text-white">
					{user?.name ? user.name[0].toUpperCase() : "U"}
				</div>
				<div className="text-left">
					<div className="text-sm font-medium text-white">{user?.name || "Unknown User"}</div>
					<div className="text-xs text-gray-300">{user?.email || "no-email@example.com"}</div>
				</div>
			</div>

			<button
				onClick={onLogout}
				className="bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded-md"
				aria-label="Logout"
			>
				Logout
			</button>
		</div>
	);
}
