import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import * as assert from "assert";

import { Counter } from "../target/types/counter";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const counterKp = new anchor.web3.Keypair();
  const creationCtx = {
    myCounter: counterKp.publicKey,
    authority: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  };
  const updatingCtx = {
    authority: provider.wallet.publicKey,
    myCounter: counterKp.publicKey,
  };
  const deletionCtx = {
    myCounter: counterKp.publicKey,
    authority: provider.wallet.publicKey,
  };

  it("Is initialized!", async () => {
    const count = new BN(0);

    const tx = await program.methods
      .create(count)
      .accounts(creationCtx)
      .signers([counterKp])
      .rpc();

    const counter = await program.account.counter.fetch(counterKp.publicKey);
    // Ensure it has the right data.
    assert.equal(counter.owner.toBase58(), provider.publicKey.toBase58());
    assert.ok(count.eq(counter.number));
  });

  it("Increasing counter", async () => {
    // get current state of counter
    const counterOrigin = await program.account.counter.fetch(
      counterKp.publicKey
    );

    const tx = await program.methods
      .increase()
      .accounts(updatingCtx)
      .signers([])
      .rpc();

    const counter = await program.account.counter.fetch(counterKp.publicKey);
    assert.equal(
      counterOrigin.number.toNumber() + 1,
      counter.number.toNumber()
    );
  });

  it("Decreasing counter", async () => {
    // get current state of counter
    const counterOrigin = await program.account.counter.fetch(
      counterKp.publicKey
    );

    const tx = await program.methods
      .decrease()
      .accounts(updatingCtx)
      .signers([])
      .rpc();

    const counter = await program.account.counter.fetch(counterKp.publicKey);
    assert.equal(
      counterOrigin.number.toNumber() - 1,
      counter.number.toNumber()
    );
  });

  it("Deleting counter", async () => {
    const tx = await program.methods
      .delete()
      .accounts(deletionCtx)
      .signers([])
      .rpc();

    try {
      const counter = await program.account.counter.fetch(counterKp.publicKey);
    } catch {
      console.log("Ok, fallo como se esperaba");
    }
  });
});
