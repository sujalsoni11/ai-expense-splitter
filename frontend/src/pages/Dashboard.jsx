// ONLY UI IMPROVED — NO STRUCTURE CHANGE

return (
  <div className="space-y-10 px-2 sm:px-4">

    {/* HEADER */}
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Welcome, {user.name.split(' ')[0]}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your shared expenses effortlessly.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 backdrop-blur-xl transition-all hover:bg-white/[0.08] hover:scale-[1.02]"
        >
          <Users className="h-4 w-4" />
          Join Trip
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-lg transition-all hover:scale-[1.05] hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </button>
      </div>
    </header>

    {/* EMPTY STATE */}
    {trips.length === 0 ? (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl py-28 text-center shadow-[0_20px_80px_rgba(0,0,0,0.6)]">

        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <Wallet className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-semibold text-white">
          No trips yet
        </h3>

        <p className="mt-2 text-slate-400 max-w-sm">
          Create or join a trip to start tracking expenses.
        </p>
      </div>
    ) : (

      /* TRIP CARDS */
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Link
            key={trip._id}
            to={`/trip/${trip._id}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
          >

            {/* Glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/10 blur-3xl rounded-full opacity-40 group-hover:scale-150 transition-all"></div>

            <div className="relative z-10">

              <div className="mb-4 flex justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {trip.name}
                </h3>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-4 w-4" />
                  {trip.members?.length || 1}
                </div>

                {trip.budget > 0 && (
                  <div className="flex items-center gap-1 text-white font-medium">
                    ₹{trip.budget}
                  </div>
                )}
              </div>

            </div>
          </Link>
        ))}
      </div>
    )}

    {/* CREATE MODAL */}
    {showCreateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">

          <h3 className="mb-5 text-xl text-white font-semibold">
            Create Trip
          </h3>

          {error && <div className="mb-3 text-red-400">{error}</div>}

          <form onSubmit={handleCreateTrip} className="space-y-4">
            <input
              type="text"
              required
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/30"
              placeholder="Trip name"
            />

            <input
              type="number"
              value={newTripBudget}
              onChange={(e) => setNewTripBudget(e.target.value)}
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-white"
              placeholder="Budget"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl bg-white/10 py-2.5 text-slate-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-white"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* JOIN MODAL */}
    {showJoinModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">

          <h3 className="mb-5 text-xl text-white font-semibold">
            Join Trip
          </h3>

          <form onSubmit={handleJoinTrip} className="space-y-4">
            <input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-white font-mono"
              placeholder="Invite Code"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="flex-1 rounded-xl bg-white/10 py-2.5 text-slate-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-white"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

  </div>
);