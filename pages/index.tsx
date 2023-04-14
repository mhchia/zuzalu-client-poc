import JSONBig from "json-bigint";
import { useState } from "react";
import { CollapsableCode } from "../components/Core";
import { ExampleContainer } from "../components/ExamplePage";
import { PendingPCDStatusDisplay } from "../components/PendingPCDStatusDisplay";
import {
  PASSPORT_SERVER_URL,
  PASSPORT_URL,
  SEMAPHORE_GROUP_URL,
} from "../src/constants";
import { requestProofFromPassport } from "../src/util";
import {
  requestZuzaluRLNUrl,
  usePassportResponse,
  usePCDMultiplexer,
  usePendingPCD,
  useRLNProof,
} from "../src/passport-interface";

/**
 * Example page which shows how to use a Zuzalu-specific prove screen to
 * request a RLN proof as a third party developer.
 */
export default function Page() {
  const [passportPCDStr, passportPendingPCDStr] = usePassportResponse();
  const [serverProving, setServerProving] = useState(false);
  const [pendingPCDStatus, serverPCDStr] = usePendingPCD(
    passportPendingPCDStr,
    PASSPORT_SERVER_URL
  );
  const pcdStr = usePCDMultiplexer(passportPCDStr, serverPCDStr);
  const { proof, group, valid } = useRLNProof(
    SEMAPHORE_GROUP_URL,
    pcdStr
  );

  return (
    <>
      <h2>Zuzalu RLN Proof</h2>
      <ExampleContainer>
        <button
          onClick={() => requestZuzaluMembershipProof(serverProving)}
          disabled={valid}
        >
          Request RLN Proof
        </button>
        <label>
          <input
            type="checkbox"
            checked={serverProving}
            onChange={() => {
              setServerProving((checked: boolean) => !checked);
            }}
          />
          server-side proof
        </label>
        {passportPendingPCDStr && (
          <>
            <PendingPCDStatusDisplay status={pendingPCDStatus} />
          </>
        )}
        {proof != null && (
          <>
            <p>Got Zuzalu Membership Proof from Passport</p>
            <CollapsableCode code={JSONBig({ useNativeBigInt: true }).stringify(proof)} />
            {group && <p>✅ Loaded group, {group.members.length} members</p>}
            {valid === undefined && <p>❓ Proof verifying</p>}
            {valid === false && <p>❌ Proof is invalid</p>}
            {valid === true && <p>✅ Proof is valid</p>}
          </>
        )}
        {valid && <p>Welcome, anon</p>}
      </ExampleContainer>
    </>
  );
}

// Show the Passport popup, ask the user to show anonymous membership.
function requestZuzaluMembershipProof(proveOnServer: boolean) {
  const rlnIdentifier = "12345";
  const signal = "1337";
  const epoch = "2";
  const proofUrl = requestZuzaluRLNUrl(
    PASSPORT_URL,
    window.location.origin + "/popup",
    SEMAPHORE_GROUP_URL,
    rlnIdentifier,
    signal,
    epoch,
    proveOnServer
  );

  requestProofFromPassport(proofUrl);
}
