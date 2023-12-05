import argparse
from datetime import datetime
import json
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
import aiohttp
from substrateinterface import Keypair

pair = Keypair.create_from_mnemonic('fan powder crumble lunar citizen thank skate casino enact suit yellow another')
now = datetime.utcnow()
now_ms = int((now - datetime(1970, 1, 1)).total_seconds() * 1000)
contents = f'{pair.ss58_address}|{now_ms}'
signature = '0x' + pair.sign(contents).hex()

login_args = {
    'address': pair.ss58_address,
    'signature': {
        'value': signature,
        'signedOn': now.isoformat(),
    }
}

jar = aiohttp.CookieJar()

env = {
    'local': 'http://localhost:8000/api/graphql',
    'stage': 'https://staging.engi.network/api/graphql',
    'prod': 'https://engi.network/api/graphql',
}

mutations = {
    'auth': '''
        mutation Auth($args: LoginArguments!){
            auth {
                login(args: $args) {
                    user {
                        email
                        display
                    }
                }
            }
        }
    ''',
    'draft': '''
        mutation Drapht($args: CreateDraftArguments!, $signature: SignatureArguments!) {
            draft {
                create(args: $args, signature: $signature)
            }
        }
    ''',
    'update-user': '''
        mutation UpdateUser($userArgs: UpdateUserArguments!) {
          user {
            update(args: $userArgs) {
              profileImageUrl
              wallet
            }
          }
        }
    ''',
    'update-draft': '''
        mutation Drapht($args: UpdateDraftArguments!) {
            draft {
                update(args: $args)
            }
        }
    ''',
    'url': '''
        mutation ImageUrl($contentType: String!) {
            user {
                getProfileImagePreSignedUrl(contentType: $contentType)
            }
        }
    ''',
    'enroll': '''
        mutation GithubEnrollment($code: String!, $installationId: String!) {
            github {
                enroll(args: { code: $code, installationId: $installationId })
            }
        }
    ''',
}

query = {
    'account': '''
        query Acct($id: String!) {
            account(id: $id) {
                nonce
                data {
                    free
                    reserved
                }
            }
        }
    ''',
    'auth': '''
        query Auth {
            auth {
                currentUser {
                    email
                    balance
                    wallet
                }
            }
        }
    ''',
    'patchfile': '''
        query PatchFile($args: PatchFileRequestArguments!) {
            github {
                patchfile(args: $args)
            }
        }
    ''',
    'job': '''
        query Job($id: UInt64!) {
            job(id: $id) {
                job {
                    id
                    creator
                    funding
                    createdOn {
                        number
                        dateTime
                    }
                    updatedOn {
                        number
                        dateTime
                    }
                    status
                    complexity {
                        sLOC
                        cyclomatic
                    }
                    attemptCount
                    solutionUserCount
                    averageProgress {
                        numerator
                        denominator
                    }
                    currentUserSubmissions {
                        status
                        attemptCreated
                        userInfo {
                            address
                            display
                            profileImageUrl
                            createdOn
                            createdJobsCount
                            solvedJobsCount
                        }
                        attemptId
                        attempt {
                            status
                            results {
                                identifier
                                stdout
                                stderr
                                returnCode
                            }
                            tests {
                                id
                                result
                                failedResultMessage
                            }
                        }
                        solve {
                            status
                            results {
                                solutionId
                                resultHash
                            }
                        }
                    }
                    currentUserSolution {
                        solutionId
                        jobId
                        author
                        patchUrl
                        attempt {
                            attemptId
                            attempter
                            tests {
                                id
                                result
                                failedResultMessage
                            }
                        }
                    }
                    leadingSolution {
                        solutionId
                        jobId
                        author
                        patchUrl
                        attempt {
                            attemptId
                            attempter
                            tests {
                                id
                                result
                                failedResultMessage
                            }
                        }
                    }
                    currentUserSubmissions {
                        status
                        attemptCreated
                        attemptId
                    }
                    solution {
                        solutionId
                        jobId
                        author
                        patchUrl
                        attempt {
                            attemptId
                            attempter
                            tests {
                                id
                                result
                                failedResultMessage
                            }
                        }
                    }
                    technologies
                    tests {
                        id
                        result
                        failedResultMessage
                        required
                    }
                    requirements {
                        isEditable
                        isAddable
                        isDeletable
                    }
                    repository {
                        url
                        branch
                        commit
                        organization
                        name
                        fullName
                        readme
                        avatarUrl
                    }
                    name
                }
                creatorUserInfo {
                    address
                    display
                    profileImageUrl
                    createdOn
                    createdJobsCount
                    solvedJobsCount
                }
            }
        }
    ''',
    'jobs': '''
        query Jobs($query: JobsQueryArguments) {
          jobs(query: $query) {
            result {
              totalCount
              items {
                id
                creator
                funding
                repository {
                  url
                  branch
                  commit
                }
                technologies
                name
                tests {
                  ...test
                }
                requirements {
                  isEditable
                  isAddable
                  isDeletable
                }
                solution {
                  solutionId
                  jobId
                  author
                  patchUrl
                  attempt {
                    attemptId
                    attempter
                    tests {
                      ...testAttempt
                    }
                  }
                }
                createdOn {
                  ...blockReference
                }
                updatedOn {
                  ...blockReference
                }
                status
                attemptCount
                solutionUserCount
                averageProgress {
                  numerator
                  denominator
                }
              }
            }
          }
        }

        fragment test on Test {
          id
          required
        }

        fragment testAttempt on TestAttempt {
          id
          result
          failedResultMessage
        }

        fragment blockReference on BlockReference {
          number
          dateTime
        }
    ''',
    'draft': '''
        query Draft($id: String!) {
            draft(id: $id) {
                id
                isEditable
                isDeletable
                tests
                analysis {
                    id
                    repositoryUrl
                    directoryEntries
                    status
                    technologies {
                    }
                }
            }
        }
    ''',
    'drafts': '''
        query Drafts($args: ListDraftsArguments) {
            drafts(args: $args) {
                id
                isEditable
                isDeletable
                analysis {
                    id
                    repositoryUrl
                    status
                }
            }
        }
    ''',
    'engineer': '''
        query Engineer($id: String!) {
            engineer(id: $id) {
                displayName
                profileImageUrl
                email
                balance
                bountiesSolved
                bountiesCreated
                earnings {
                    pastDay
                    pastWeek
                    pastMonth
                    lifetime
                }
                techologies
                repositoriesWorkedOn
                rootOrganization
            }
        }
    '''
}

def get_client(endpoint):
    transport = AIOHTTPTransport(url=endpoint, client_session_args={'cookie_jar': jar})
    return Client(transport=transport, fetch_schema_from_transport=True)

def do_query(query, params):
    query = gql(query)
    result = client.execute(query, variable_values=params)
    print(json.dumps(result))

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Kweerrie tool")
    parser.add_argument('--do-auth', action='store_true')
    parser.add_argument('--check-auth', action='store_true')
    parser.add_argument('--env', default='local', choices=['local', 'stage', 'prod'])
    parser.add_argument('--job', type=str)
    parser.add_argument('--jobs', action='store_true')
    parser.add_argument('--send-draft', action='store_true')
    parser.add_argument('--update-draft', type=str)
    parser.add_argument('--get-draft', type=str)
    parser.add_argument('--get-account', type=str)
    parser.add_argument('--raw', type=str)
    parser.add_argument('--engineer', type=str)
    parser.add_argument('--drafts', action='store_true')
    parser.add_argument('--enroll', action='store_true')
    parser.add_argument('--patchfile', action='store_true')
    parser.add_argument('--update-user', type=str)
    parser.add_argument('--get-url', action='store_true')


    args = parser.parse_args()

    client = get_client(env[args.env])

    if args.do_auth:
        do_query(mutations['auth'], params={'args': login_args})

    if args.check_auth:
        do_query(query['auth'], {})
    if args.job:
        do_query(query['job'], {"id": args.job})
    if args.patchfile:
        params = {
            'args': {
                'baseRepositoryUrl': 'https://github.com/engi-network/demo-csharp',
                'baseRepositoryCommit': '33c5d5f36bae824ee331891b60c47893381a337b',
                'forkRepositoryUrl': 'https://github.com/tjsharp1/demo-csharp',
                'forkRepositoryCommit': 'b0d76884a9d8425cc602735012c5fca2ca4a409a',
            }
        }
        do_query(query['patchfile'], params)
    if args.jobs:
        do_query(query['jobs'], params={'query': {'skip': 0, 'limit': 10, "orderByDirection": "DESC"}})
    if args.get_url:
        do_query(mutations['url'], params={ 'contentType': 'image/png' })
    if args.update_user:
        params = {
          "userArgs": {
            "profileImageUrl": args.update_user,
          }
        }
        do_query(mutations['update-user'], params)
    if args.update_draft:
        params = {
            'args': {
                'id': args.update_draft,
                'isAddable': '*',
                'isEditable': '*',
                'isDeletable': '*',
                'funding': 4000,
                'name': 'dum-stuff',
                'tests': [ 'won', 'to', 'three']
            }
        }
        do_query(mutations['update-draft'], params)
    if args.send_draft:
        params = {
            'args': {
                'url': 'https://github.com/engi-network/demo-jest-design-matcher-nextjs',
                #'url': 'https://github.com/jfwu90/demo-jest-design-matcher-nextjs',
                'branch': 'main',
                'commit': '7afc935c0433201c3a163cdddc7f35ad03b5f1c9',
                #'commit': '7afc935c0433201c3a163cdddc7f35ad03b5f1c9',

            },
            'signature': login_args['signature'],
        }
        do_query(mutations['draft'], params)
    if args.drafts:
        do_query(query['drafts'], {"args": {"skip": 0, "take": 10}})
    if args.get_draft:
        do_query(query['draft'], params={"id": args.get_draft})
    if args.get_account:
        do_query(query['account'], params={"id": args.get_account})
    if args.enroll:
        params = { "code": "e366e369f091e33dd3f7", "installationId": "43766098" }
        do_query(mutations['enroll'], params=params)
    if args.engineer:
        params = { "id": pair.ss58_address }
        do_query(query['engineer'], params=params)
    if args.raw:
        with open(args.raw, 'r') as f:
            stuff = json.load(f)
            do_query(stuff['query'], params=stuff['variables'])
